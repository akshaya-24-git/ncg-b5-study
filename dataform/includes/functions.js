// Global values
// Global Labels are used for data_processing in biqquery dataobjects

const gbl_getLabels = {

    "portfolio": "addg",
    "product_group": "dataverse",
    "product": "dataverse",
    //   "env":  dataform.projectConfig.vars.dataverse_project.split("-").pop(),
    "dv_name": "dataverse",
    "dps_name": "dataverse_process"
};

const projectConfig = {
    dataverse_project: "fy23-asc-addg-dataverse",
    stg_dataverse_process_dataset: "audit_dataset_health"
};

const dv_env_vars = {
    glb_null_replace: "NULL_REPLACED",
    glb_hash_concat: '||"~"||',
    glb_hash_algorithm: "MD5",
    glb_hist_load_ts: "1900-01-01T00:00:00"
};

// Calculate the hash for the dimensional key `dk` and hash_dif.
function fn_calculateHash(input_value) {
    const {
        glb_null_replace,
        glb_hash_concat,
        glb_hash_algorithm
    } = dv_env_vars;

    //const aliasPrefix = alias ? `${alias}.` : '';

    const fetchValue = input_value;
    const value = fetchValue.map((v) => `trim(coalesce(cast(${v} as STRING), '${glb_null_replace}'))`).join('||"~"||');
    const calculateHash = `TO_HEX(${glb_hash_algorithm}(${value}))`
    return `(${calculateHash})`;
}


// Calculate the business key ,'bk'. '<>' for readability
function fn_calculateConcat(input_value) {
    const {
        glb_null_replace
    } = dv_env_vars;
    const fetchValue = input_value;
    const value = fetchValue.map((v) => `coalesce(cast(${v} as STRING), '${glb_null_replace}')`).join('||"<>"||');
    const calculateHash = `(${value})`
    return `(${calculateHash})`;
}


// Retrieve the hash key for the column `dk`.
function fn_getHashKey(input_value) {
    const fetchValue = input_value;
    return `${fetchValue[0]}`;
}

//To generate Case statment for ccl enrichment
function fn_ccl_enrich(ccl_code, alias) {
    //get ccl_code to lower case
    let v_ccl_code = ccl_code.toLowerCase();

    //import the file object to fetch necessary details
    const cerner_ccl_enrichment = require("definitions/param/source/cerner_ccl_enrichment.js");

    //create the empty variables and aliasPrefix to get alias value if available
    let ccl_query = "";
    let default_query = "";
    const aliasPrefix = alias ? `${alias}.` : '';

    // switch case to create pass the proper parameter and create statement
    switch (v_ccl_code) {
        case "admit_src_cd":
            ccl_query = Object.entries(cerner_ccl_enrichment.admit_src_cd).map(function([key, value]) {
                if (key != "default") {
                    return `when cast(${aliasPrefix}${v_ccl_code} as string) = "${key}" then "${value}"`;
                }
            }).join('\n');
            default_query = Object.entries(cerner_ccl_enrichment.admit_src_cd).map(function([key, value]) {
                if (key == "default") {
                    return `else "${value}"`;
                }
            }).join('\n');
            break;

        case "disch_disposition_cd":
            ccl_query = Object.entries(cerner_ccl_enrichment.disch_disposition_cd).map(function([key, value]) {
                if (key != "default") {
                    return `when cast(${aliasPrefix}${v_ccl_code} as string) = "${key}" then "${value}"`;
                }
            }).join('\n');
            default_query = Object.entries(cerner_ccl_enrichment.disch_disposition_cd).map(function([key, value]) {
                if (key == "default") {
                    return `else "${value}"`;
                }
            }).join('\n');
            break;
    }
    //trimming the unncessary spaces before default statement
    default_query = default_query.trim();
    return ` case ${ccl_query} ${default_query} end`;

}


function fn_setHistWhere(object, alias) {
    //extract column name used for historical load and the value
    const hist_src_col = object.source_hist_load_column;
    const hist_load_ts = dv_env_vars.glb_hist_load_ts;

    // alias if passed will be used else skipped
    const aliasPrefix = alias ? `${alias}.` : '';

    return `${aliasPrefix}${hist_src_col} > '${hist_load_ts}'`;
}

//Incremental function, uses batch table for the time interval 
//to fetch the data from source
function fn_setIncrWhere(source, batch, alias) {
    // extract values from object being passed
    let inc_src_col = source.source_incr_load_column;
    const fullScanFlag = source.source_full_read_flag;
    const OverlapFlag = source.pvt_overlap_days;

    const batch_code = batch.batch_code;

    //extract environmental and global variables
    const batch_table = dv_env_vars.glb_dv_audit_batch_control;
    const hist_load_ts = dv_env_vars.glb_hist_load_ts;

    //declare individual query condition
    const greaterThan = `(SELECT batch_extract_load_start_ts FROM ${batch_table} WHERE batch_code = "${batch_code}")`;
    const lessThan = `(SELECT batch_extract_load_end_ts FROM ${batch_table} WHERE batch_code = "${batch_code}")`;

    // alias if passed will be used else skipped
    const aliasPrefix = alias ? `${alias}.` : '';

    // consolidated condition
    const condition = fullScanFlag === "N" ?
        `BETWEEN ${greaterThan} AND ${lessThan}` :
        `> "${hist_load_ts}"`;

    const condition1 = fullScanFlag === "N" ?
        `BETWEEN DATETIME_SUB(${greaterThan},INTERVAL ${OverlapFlag} day)  AND ${lessThan}` :
        `> "${hist_load_ts}"`;
    // const condition2 = fullScanFlag === "N" ?
    // `BETWEEN DATETIME_SUB(${greaterThan},INTERVAL 7 day)  AND ${lessThan}` :
    // `> "${hist_load_ts}"`;

    if (OverlapFlag) {
        return `WHERE cast(${aliasPrefix}${inc_src_col} as DATETIME) ${condition1}`;
    } else {
        return `WHERE cast(${aliasPrefix}${inc_src_col} as DATETIME) ${condition}`;
    }

}

function fn_updateColList(column_list) {
    return column_list.map(col => `tgt.${col}=src.${col}`).join(',');
}


//----UPDATED (replaced 'AND' with 'OR')----- fetch 'compare_list' array and create comparison statement separated by logical 'OR'
function fn_updateColCompareList(column_list) {
    return column_list.map(col => `coalesce(CAST(tgt.${col} AS STRING),'^') != coalesce(CAST(src.${col} AS STRING),'^')`).join(' OR ');
}


/**
 * Creates Insert Only Statement for the dataverse.
 * Returns the Insert Only statement by comparing bk and compare_list values
 * between the processed and target tables available in target parameter file.
 * @param   {string}    processed_table - table name having incremental data
 * @param   {string}    target_table - table in dataverse
 * @param   {string}    target - object containing variables from target parameter file
 * @returns {string}    sql expression
 */
function fn_insertload(processed_table, target_table, target) {
    const {
        bk,
        insert_list,
        update_list
    } = target;

    // 1. Build the source join key from your bk array (handling hardcoded literals like 'b5_ka')
    let src_join_key = bk.map((v) => v.startsWith("'") ? `${v} ` : `stg.${v} `).join(" || '<>' || ");
    
    // 2. Map the update list array directly into clean "tgt.col = src.col" mappings
    let update_mappings = update_list.map(col => `tgt.${col} = src.${col}`).join(', ');

    // 3. Return the clean, straightforward MERGE statement
    return `MERGE INTO ${target_table} AS tgt\n` +
        `USING (\n` +
        `  SELECT ${src_join_key} AS join_key, stg.*\n` +
        `  FROM ${processed_table} AS stg\n` +
        `) src\n` +
        `ON src.join_key = tgt.dim_patient_bk\n` +
        `WHEN MATCHED THEN\n` +
        `  UPDATE SET ${update_mappings}\n` +
        `WHEN NOT MATCHED THEN\n` +
        `  INSERT (${insert_list.join(', ')})\n` +
        `  VALUES (${insert_list.map(col => `src.${col}`).join(', ')})`;
}



// function fn_SCD1load(config) {
//     // Destructure properties passed from your Dataform framework execution
//     const {
//         source_ref,    // e.g., the name of your staging CTE or view
//         project_id,    // Target GCP project
//         tgt_dataset,   // Target Dataset 
//         target_name,   // Target Table name
//         hash_column,   // Name of your hashdiff column (e.g., 'hashdiff')
//         target_params  // The entire 'target' object exported from your param file
//     } = config;

//     const { bk, insert_list, update_list } = target_params;

//     // 1. Determine the join condition using the Business Key (BK) field name from target params
//     // In your target file, bk is ["diagnosis_bk"] or ["icd10_code"]
//     const natural_key = bk[0]; 

//     // 2. Build the INSERT column list dynamically
//     const insert_cols = insert_list.join(",\n        ");

//     // 3. Map values from the source reference alias 'sub'
//     const values_cols = insert_list.map(col => `sub.${col}`).join(",\n        ");

//     // 4. Dynamically build the UPDATE SET statement for columns that changed
//     const update_set_clause = update_list
//         .map(col => `target.${col} = sub.${col}`)
//         .join(",\n        ");

//     // 5. Generate and return a clean, optimized BigQuery SCD Type 1 MERGE block
//     return `
//     MERGE INTO \`${project_id}.${tgt_dataset}.${target_name}\` AS target
//     USING ${source_ref} AS sub
//     ON target.${natural_key} = sub.${natural_key}

//     -- Update row data if the business key matches but its contents differ
//     WHEN MATCHED AND target.${hash_column} != sub.${hash_column} THEN
//       UPDATE SET
//         ${update_set_clause}

//     -- Insert brand new record configurations if no business key match is found
//     WHEN NOT MATCHED THEN
//       INSERT (
//         ${insert_cols}
//       )
//       VALUES (
//         ${values_cols}
//       )
//     `;
// }






function fn_SCD1load(config) {
    const {
        source_ref,
        target_name,
        project_id,
        tgt_dataset,
        hash_column,
        natural_key,
        target_params
    } = config;

    // 1. Build the INSERT column list dynamically
    const insert_cols = target_params.insert_list.join(",\n    ");

    // 2. Map standard values straight from the source alias 'sub'
    const values_cols = target_params.insert_list.map(col => `sub.${col}`).join(",\n    ");

    // 3. Dynamically build the UPDATE SET statement
    const update_set_clause = target_params.update_list
        .map(col => `target.${col} = sub.${col}`)
        .join(",\n        ");

    return `
    MERGE INTO \`${project_id}.${tgt_dataset}.${target_name}\` AS target
    USING ${source_ref} AS sub
    ON target.${natural_key} = sub.${natural_key}

    WHEN MATCHED AND target.${hash_column} != sub.${hash_column} THEN
      UPDATE SET
        ${update_set_clause}

    WHEN NOT MATCHED THEN
      INSERT (
        ${insert_cols}
      )
      VALUES (
        ${values_cols}
      );
  `;
}
/** Exception Handling functions **/

function fn_exceptionFind(exception, source) {

    //update naming and import style
    let expt_tgt_id = exception.expt_tgt_id;
    let expt_tgt_table = source.target_table;
    let expt_src_table = source.source_table;
    let expt_src_cd = exception.src_cd;
    let expt_src_bk = exception.tgt_expt_bk;
    let expt_src_bk_value = exception.tgt_expt_bk;
    let expt_vld_fm_ts = 'vld_fm_ts'; //vld_fm_ts from process tbl
    let expt_vld_to_ts = '9999-12-31T00:00:00';

    let expt_tgt_dk = exception.tgt_expt_dk;

    expt_tgt_dk = expt_tgt_dk.map(function(element, index) {
        return `'${element}' AS expt_tgt_dk_${index},
    ${element} AS expt_tgt_dk_value_${index}`
    });

    let case_statement = exception.tgt_expt_dk;
    case_statement = case_statement.map(function(element, index) {
        return ` CASE 
    WHEN ${element} = '-1' THEN '9001'
    ELSE cast(NULL as string)
    END AS expt_cd_${index}`
    }).join(',\n');

    return `${expt_tgt_id} AS expt_tgt_id,
    '${expt_tgt_table}' AS expt_tgt_table,
    '${expt_src_table}' AS expt_src_table,
    '${expt_src_cd}' AS expt_src_cd,
    '${expt_src_bk}' AS expt_src_bk,
     ${expt_src_bk_value} AS expt_src_bk_value,
     ${expt_tgt_dk},
     ${case_statement},
     ${expt_vld_fm_ts} AS expt_vld_fm_ts,
    cast('${expt_vld_to_ts}' as datetime) AS expt_vld_to_ts`;
}

function fn_generateExceptionSQL(exception, source, stage_table) {
    const {
        expt_tgt_id,
        src_cd,
        tgt_expt_dk,
        src_expt_bk,
    } = exception;

    const {
        source_table,
        target_table
    } = source;

    const sqlBlocks = tgt_expt_dk.map((dk, index) => {
        const sql = `
      select distinct
        cast(expt_tgt_id as Integer) as expt_tgt_id,
        cast(expt_tgt_table as string) as tgt_table,
        cast(expt_src_table as string) as src_table,
        cast(expt_src_cd as string) as src_cd,
        cast(expt_src_bk as string) as src_bk,
        cast(expt_src_bk_value as string) as src_bk_value,
        cast(expt_tgt_dk_${index} as string) as tgt_dk,
        cast(expt_tgt_dk_value_${index} as string) as tgt_dk_value,
        cast(expt_cd_${index} as string) as expt_cd,
        cast(expt_vld_fm_ts as datetime) as vld_fm_ts,
        cast(expt_vld_to_ts as datetime) as vld_to_ts,
      from ${stage_table}
      --where expt_cd_${index} IS NOT NULL
    `;
        return sql;
    });

    return sqlBlocks.join('\nUNION ALL\n');
}

// fn_exceptionLoad takes stage table, exception table, exception and source object as arguments.
// It returns the SCD Type-1 statement by comparing necessary values between the processed and target tables.
function fn_exceptionLoad(stage_table, exception_table, exception, source) {

    const baseQuery = `
    MERGE INTO ${exception_table} AS tgt
    USING (
      ${fn_generateExceptionSQL(exception, source, stage_table)}
    ) AS src
    ON src.src_bk_value = tgt.src_bk_value and src.tgt_dk = tgt.tgt_dk 
    WHEN MATCHED and (src.tgt_dk_value != tgt.tgt_dk_value) and tgt.expt_tgt_id = src.expt_tgt_id
    THEN UPDATE SET tgt.vld_to_ts = src.vld_fm_ts
    WHEN NOT MATCHED and src.expt_cd IS NOT NULL
    THEN INSERT(expt_tgt_id,tgt_table,src_table,src_cd,src_bk,src_bk_value,
    tgt_dk,tgt_dk_value,expt_cd,vld_fm_ts,vld_to_ts) 
    VALUES (expt_tgt_id,tgt_table,src_table,src_cd,src_bk,src_bk_value,
    tgt_dk,tgt_dk_value,expt_cd,vld_fm_ts,vld_to_ts)`;

    return baseQuery;
}

function fn_getExceptionDK(src_col, tgt_col, dk_col) {
    return `
CASE
WHEN (${src_col} IS NULL or cast(${src_col} as string) = '0') THEN '-2'
WHEN (${tgt_col} IS NULL or cast(${tgt_col} as string) = '0') and (${src_col} IS NOT NULL and cast(${src_col} as string) != '0') THEN '-1'
WHEN (${tgt_col} IS NOT NULL or cast(${tgt_col} as string) != '0') and ${dk_col} IS NULL THEN '-1'
ELSE ${dk_col}
END`
}


function fn_defineArrayList(col_list) {
    return col_list.map((col) => `"${col}"`).join(',');
}

function fn_GetArrayVal(col_list) {
    col_list = Object.entries(col_list).map(([key, value]) => "'" + value + "'");
    return col_list;
}

function fn_auditBatchStart(batch) {
    /*- **Function Description:** Used to initiate the auditing of a data batch and record the start of the audit.
      - **Input:** batch object (batch_code, audit_batch_id), user object (user_id, user_name).
      - **Output:** out_batch_run_info (String) indicating the success or failure of the batch audit initiation.*/
    const {
        batch_source_id
    } = batch;
    let batch_code = batch.batch_code;
    let batch_desc = batch.batch_desc;
    let col_list = batch_source_id;
    const batch_source_id_list = fn_defineArrayList(col_list);
    let dataverse_project = projectConfig.dataverse_project;
    let dataprocess_dataset = projectConfig.stg_dataverse_process_dataset;
    let env = projectConfig.dataverse_project.split("-").pop();
    //let env=genv.split("-").pop();
    return `DECLARE out_audit_batch_info STRING;
              SET @@query_label = "name:dataverse_process,portfolio:addg,product_group:dataverse,product:dataverse,env:${env}";  

    TRUNCATE TABLE \`${dataverse_project}.${dataprocess_dataset}.dv_audit_run_trace\`;
    CALL \`${dataverse_project}.${dataprocess_dataset}.auditBatchStart\`("${batch_code}",[${batch_source_id_list}],"${batch_desc}",out_audit_batch_info);
  
    INSERT INTO \`${dataverse_project}.${dataprocess_dataset}.dv_audit_run_trace\`
    (run_timestamp,note,output)
    VALUES(current_datetime(),'auditBatchStart',out_audit_batch_info);`;
}


function fn_auditJobStart(batch, job) {
    /*- **Function Description:** Initiates the auditing of a specific job within a batch and records the start of the job audit.
      - **Input:** batch object (batch_code), job object (job_code).
      - **Output:** out_job_run_info (String) indicating the success or failure of the job audit initiation.*/
    let batch_code = batch.batch_code;
    let job_code = job.job_code;
    let job_desc = job.job_desc;
    let batch_job_list = batch.job_code;
    let dataverse_project = projectConfig.dataverse_project;
    let dataprocess_dataset = projectConfig.stg_dataverse_process_dataset;
    let env = projectConfig.dataverse_project.split("-").pop();
    if (batch_job_list.includes(job_code)) {
        // Job code  found in the list call the JobOpen

        return `DECLARE out_job_run_info STRING;
            SET @@query_label = "name:dataverse_process,portfolio:addg,product_group:dataverse,product:dataverse,env:${env}";

        CALL \`${dataverse_project}.${dataprocess_dataset}.auditJobStart\`("${batch_code}","${job_code}","${job_desc}",out_job_run_info);
            INSERT INTO \`${dataverse_project}.${dataprocess_dataset}.dv_audit_run_trace\`(run_timestamp,note,output) VALUES(current_datetime(),'auditJobStart',out_job_run_info);`;
    } else {
        // Job code not found in the list, handle the exception
        return ` INSERT INTO \`${dataverse_project}.${dataprocess_dataset}.dv_audit_run_trace\`(run_timestamp, output, note) VALUES(current_datetime(),'job not found','exception: not in the list');`;
    }
}


function fn_auditStepStart(batch, job, filename) {
    /*- **Function Description:** Initiates the auditing of a specific step within a batch and records the start of the step.
      - **Input:** batch object (batch_code, audit_batch_id), job object (job_code), filename (String).
      - **Output:** out_stp_run_info (String) indicating the success or failure of the step audit initiation.*/
    let batch_code = batch.batch_code;
    let job_code = job.job_code;
    let subject_area = job.lbl_subject_area;
    let source = job.lbl_source;
    let dataverse_project = projectConfig.dataverse_project;
    let dataprocess_dataset = projectConfig.stg_dataverse_process_dataset;
    let env = projectConfig.dataverse_project.split("-").pop();
    return `DECLARE out_stp_run_info STRING;
            SET @@query_label = "name:dataverse_process,portfolio:addg,product_group:dataverse,product:dataverse,env:${env},subject_area:${subject_area},source:${source}";
            
    CALL \`${dataverse_project}.${dataprocess_dataset}.auditStepStart\`("${batch_code}","${job_code}","${filename}",out_stp_run_info);
    
    INSERT INTO \`${dataverse_project}.${dataprocess_dataset}.dv_audit_run_trace\`
    (run_timestamp,note,output)
    VALUES(current_datetime(),'auditStepStart',out_stp_run_info);`;
}


function fn_auditStepEnd(batch, job, filename) {
    /*- **Function Description:** Marks the end of an auditing step within a batch, records the audit closure, and logs relevant information.
      - **Input:** batch object (batch_code), job object (job_code), filename (String).
      - **Output:** out_stp_run_info (String) containing information about the step audit closure.*/
    let batch_code = batch.batch_code;
    let job_code = job.job_code;
    let dataverse_project = projectConfig.dataverse_project;
    let dataprocess_dataset = projectConfig.stg_dataverse_process_dataset;
    let env = projectConfig.dataverse_project.split("-").pop();
    return `SET @@query_label = "name:dataverse_process,portfolio:addg,product_group:dataverse,product:dataverse,env:${env}";

    CALL \`${dataverse_project}.${dataprocess_dataset}.auditStepEnd\`("${batch_code}","${job_code}","${filename}",out_stp_run_info);
    
    
    INSERT INTO \`${dataverse_project}.${dataprocess_dataset}.dv_audit_run_trace\`
    (run_timestamp,note,output)
    VALUES(current_datetime(),'auditStepEnd',out_stp_run_info);`;
}


function fn_auditJobEnd(batch, job) {
    /* - **Function Description:** Marks the end of a job audit within a batch, records the audit closure, and logs relevant information.
       - **Input:** batch object (batch_code), job object (job_code).
       - **Output:** out_job_run_info (String) containing information about the job audit closure.*/
    let batch_code = batch.batch_code;
    let job_code = job.job_code;
    let dataverse_project = projectConfig.dataverse_project;
    let dataprocess_dataset = projectConfig.stg_dataverse_process_dataset;
    let env = projectConfig.dataverse_project.split("-").pop();
    return `DECLARE out_job_run_info STRING;
            SET @@query_label = "name:dataverse_process,portfolio:addg,product_group:dataverse,product:dataverse,env:${env}";

    CALL \`${dataverse_project}.${dataprocess_dataset}.auditJobEnd\`("${batch_code}","${job_code}",out_job_run_info);
    
    INSERT INTO \`${dataverse_project}.${dataprocess_dataset}.dv_audit_run_trace\`
    (run_timestamp,note,output)
    VALUES(current_datetime(),'auditJobEnd',out_job_run_info);`;
}



function fn_auditBatchEnd(batch) {
    /*- **Function Description:** Marks the completion of batch auditing, records the audit closure, and logs relevant information.
      - **Input:** batch object (batch_code, audit_batch_id).
      - **Output:** out_batch_run_info (String) containing information about the batch audit closure.*/
    let batch_code = batch.batch_code;
    let batch_desc = batch.batch_desc;
    let job_code = batch.job_code;
    let dataverse_project = projectConfig.dataverse_project;
    let dataprocess_dataset = projectConfig.stg_dataverse_process_dataset;
    let env = projectConfig.dataverse_project.split("-").pop();

    return `DECLARE out_audit_batch_info STRING;
            SET @@query_label = "name:dataverse_process,portfolio:addg,product_group:dataverse,product:dataverse,env:${env}";

    CALL \`${dataverse_project}.${dataprocess_dataset}.auditBatchEnd\`("${batch_code}","${job_code}","${batch_desc}",out_audit_batch_info);
    
    INSERT INTO \`${dataverse_project}.${dataprocess_dataset}.dv_audit_run_trace\`
    (run_timestamp,note,output)
    VALUES(current_datetime(),'auditBatchEnd',out_audit_batch_info);`;
}

function fn_getSourceCommonCode(source_common_code, alias) {
    const {
        source_key,
        source_value,
        descr_key,
        descr_value,
        code_key,
        code_value,
        concat_string,
        null_replace
    } = source_common_code;
    // alias if passed will be used else skipped
    const aliasPrefix = alias ? `${alias}.` : '';

    const descr = descr_value.map((descr_value) => `coalesce(trim(cast(${aliasPrefix}${descr_value} as STRING)), '${null_replace}')`);
    const code = code_value.map((code_value) => `coalesce(trim(cast(${aliasPrefix}${code_value} as STRING)), '${null_replace}')`);

    return `CONCAT('${source_key}','${concat_string}','${source_value}','${concat_string}','${descr_key}',${descr},'${concat_string}','${code_key}',${code})`;
}

function fn_getSourceCommonCode(source_common_code, alias) {
    const {
        source_key,
        source_value,
        descr_key,
        descr_value,
        code_key,
        code_value,
        concat_string,
        null_replace
    } = source_common_code;
    // alias if passed will be used else skipped
    const aliasPrefix = alias ? `${alias}.` : '';

    //const descr = descr_value.map((descr_value) => `upper(coalesce(trim(cast(${aliasPrefix}${descr_value} as STRING)), '${null_replace}'))`);
    const descr = descr_value.map((descr_value) => `coalesce(UPPER(NULLIF(TRIM(CAST(${aliasPrefix}${descr_value} AS STRING)), '')),'${null_replace}')`);
    //coalesce(UPPER(NULLIF(TRIM(CAST(${aliasPrefix}${descr_value} AS STRING)), '')),'${null_replace}')
    const code = code_value.map((code_value) => `coalesce(trim(cast(${aliasPrefix}${code_value} as STRING)), '${null_replace}')`);

    return `CONCAT('${source_key}','${concat_string}','${source_value}','${concat_string}','${descr_key}',${descr},'${concat_string}','${code_key}',${code})`;
}

function fn_getSK(src_cd, cmn_cd_sk) {
    return `CASE
  WHEN ${src_cd} IS NULL THEN '-2'
  WHEN ${src_cd} IS NOT NULL and ${cmn_cd_sk} IS NULL THEN '-1'
  ELSE ${cmn_cd_sk}
  END`
}

function fn_getDefaultStr(value) {
    let {
        glb_empty_replace
    } = dv_env_vars;
    return ` coalesce(cast(${value} as string),'${glb_empty_replace}')`;
}



// function fn_SCD2load(config) {
//     const {
//         source_ref,
//         target_name,
//         project_id,
//         tgt_dataset,
//         hash_column,
//         natural_key,
//         target_params
//     } = config;

//     // 1. Build the explicit INSERT column list
//     const insert_cols = target_params.insert_list.join(",\n        ");

//     // 2. Generate values mapping block, overriding timeline constraints on insert rows
//     const values_cols = target_params.insert_list.map(col => {
//         switch (col) {
//             case "valid_from_ts":
//                 return `CAST(CURRENT_TIMESTAMP() AS TIMESTAMP)`;
//             case "valid_to_ts":
//                 return `TIMESTAMP '9999-12-31 23:59:59'`;
//             case "is_current_ind":
//                 return `'TRUE'`;
//             default:
//                 return `sub.${col}`;
//         }
//     }).join(",\n        ");

//     // 3. Assemble and return the complete dynamic SQL MERGE statement
//     return `
//     MERGE INTO \`${project_id}.${tgt_dataset}.${target_name}\` AS target
//     USING
//       (
//         -- Subset 1: Bring in all raw, active updates from the staging layer
//         SELECT
//           source.${natural_key} AS join_key,
//           source.*
//         FROM
//           ${source_ref} AS source

//         UNION ALL

//         -- Subset 2: Target records that already exist but have a modified hashdiff token
//         SELECT
//           NULL AS join_key,
//           source.*
//         FROM
//           ${source_ref} AS source
//         JOIN
//           \`${project_id}.${tgt_dataset}.${target_name}\` AS target_table
//         ON
//           source.${natural_key} = target_table.${natural_key}
//         WHERE
//           target_table.is_current_ind = 'TRUE' 
//           AND source.${hash_column} != target_table.${hash_column}
//       ) AS sub
//     ON
//       sub.join_key = target.${natural_key} 
//       AND target.is_current_ind = 'TRUE'

//     -- Close out tracking window for matching old records when structural mutations are caught
//     WHEN MATCHED AND sub.${hash_column} != target.${hash_column} THEN
//       UPDATE SET
//         target.is_current_ind = 'FALSE',
//         target.valid_to_ts = CAST(CURRENT_TIMESTAMP() AS TIMESTAMP)

//     -- Inject both brand new natural keys and updated split-records as active historical snapshots
//     WHEN NOT MATCHED THEN
//       INSERT (
//         ${insert_cols}
//       )
//       VALUES (
//         ${values_cols}
//       )
//   `;
// }

// module.exports = {
//     fn_SCD2load
// };

function fn_SCD2load(config) {
    const {
        source_ref,
        target_name,
        project_id,
        tgt_dataset,
        hash_column,
        natural_key,
        target_params
    } = config;

    // 1. Build the explicit INSERT column list
    const insert_cols = target_params.insert_list.join(",\n        ");

    // 2. Generate values mapping block, overriding timeline constraints on insert rows
    const values_cols = target_params.insert_list.map(col => {
        switch (col) {
            case "valid_from_ts":
                return `CAST(CURRENT_TIMESTAMP() AS TIMESTAMP)`;
            case "valid_to_ts":
                return `TIMESTAMP '9999-12-31 23:59:59'`;
            case "current_ind": 
                return `'TRUE'`;
            default:
                return `sub.${col}`;
        }
    }).join(",\n        ");

    // 3. Assemble and return the complete dynamic SQL MERGE statement
    return `
    MERGE INTO \`${project_id}.${tgt_dataset}.${target_name}\` AS target
    USING
      (
        -- Subset 1: Bring in all raw, active updates from the staging layer
        SELECT
          source.${natural_key} AS join_key,
          source.*
        FROM
          ${source_ref} AS source

        UNION ALL

        -- Subset 2: Target records that already exist but have a modified hashdiff token
        SELECT
          NULL AS join_key,
          source.*
        FROM
          ${source_ref} AS source
        JOIN
          \`${project_id}.${tgt_dataset}.${target_name}\` AS target_table
        ON
          source.${natural_key} = target_table.${natural_key}
        WHERE
          target_table.current_ind = 'TRUE'
          AND source.${hash_column} != target_table.${hash_column}
      ) AS sub
    ON
      sub.join_key = target.${natural_key} 
      AND target.current_ind = 'TRUE'

    -- Close out tracking window for matching old records when structural mutations are caught
    WHEN MATCHED AND sub.${hash_column} != target.${hash_column} THEN
      UPDATE SET
        target.current_ind = 'FALSE',
        target.valid_to_ts = CAST(CURRENT_TIMESTAMP() AS TIMESTAMP)

    -- Inject both brand new natural keys and updated split-records as active historical snapshots
    WHEN NOT MATCHED THEN
      INSERT (
        ${insert_cols}
      )
      VALUES (
        ${values_cols}
      );
  `;
}


function fn_FullLoad(config) {
    const {
        source_ref,
        target_name,
        project_id,
        tgt_dataset,
        target_params
    } = config;

    // Dynamically build the explicit select columns from your insert_list parameters
    const columns_clause = target_params.insert_list.join(",\n    ");

    // We output a clean, performant statement that replaces the entire dataset target
    return `
    CREATE OR REPLACE TABLE \`${project_id}.${tgt_dataset}.${target_name}\` AS
    SELECT
      ${columns_clause}
    FROM
      ${source_ref}
  `;
}

function fn_factLoad({
    source_ref,
    target_name,
    project_id,
    tgt_dataset,
    natural_key,
    target_params
}) {

    // Get an array of all column names from the target definition object.
    // This assumes your target_params object has a property like 'columns' which is an array of strings.
    const all_columns = target_params.columns; 

    // Create the comma-separated list for the INSERT clause (e.g., "col1, col2, col3")
    const insert_columns = all_columns.join(',\n        ');

    // Create the comma-separated list for the VALUES clause, prefixing each column with the source alias 'S.'
    // e.g., "S.col1, S.col2, S.col3"
    const values_columns = all_columns.map(col => `S.${col}`).join(',\n        ');

    // Return the complete, formatted MERGE statement as a template literal string.
    return `
merge \`${project_id}.${tgt_dataset}.${target_name}\` AS T
USING ${source_ref} AS S
ON T.${natural_key} = S.${natural_key}

WHEN NOT MATCHED THEN
  INSERT (
        ${insert_columns}
  )
  VALUES (
        ${values_columns}
  );`;
}

// You would also need to export it along with your other functions
module.exports = {
    fn_auditStepStart,
    fn_auditStepEnd,
    fn_factLoad 
};

module.exports = {
    fn_calculateHash,
    fn_calculateConcat,
    fn_getHashKey,
    fn_ccl_enrich,
    fn_setHistWhere,
    fn_setIncrWhere,
    fn_insertload,
    fn_exceptionFind,
    fn_getExceptionDK,
    fn_generateExceptionSQL,
    fn_exceptionLoad,
    fn_auditBatchStart,
    fn_auditJobStart,
    fn_auditStepStart,
    fn_auditStepEnd,
    fn_auditJobEnd,
    fn_auditBatchEnd,
    fn_getSourceCommonCode,
    fn_defineArrayList,
    fn_GetArrayVal,
    fn_updateColCompareList,
    fn_defineArrayList,
    fn_getSK,
    fn_getDefaultStr,
    fn_SCD2load,
    gbl_getLabels,
    fn_SCD1load,
    dv_env_vars,
    fn_factLoad,
    fn_FullLoad
};