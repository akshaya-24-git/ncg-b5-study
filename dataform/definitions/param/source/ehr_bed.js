const source = {


// Metadata Properties matching your dataset layout

     source_table: "EHR_BED",
     stage_table: "step_tbl_process_bed_dim",
     target_table: "dim_bed",

    // 1. Dimensional Key (DK) Components used for unique hash generation
    dk: [
        "'MTRXB5'", // System tenant/source identifier
        "bed_id",
        "bed_category",
        "CAST(CURRENT_TIMESTAMP() AS STRING)"
    ],

    // 2. Business Key (BK) Components representing the natural keys
    bk: [
        "'MTRXB5'", // System tenant/source identifier
        "bed_id",
        "bed_category"
    ],

    // 3. Attribute columns monitored for changes (SCD Type 2 tracking)
    // These columns are passed to fn_calculateHash to populate the hashdiff column
    hashdiff: [
        "bed_category",
        "ac_status",
        "sharing_capacity",
        "operational_status",
        "room_number",
        "floor_number"
    ],

    // 4. Business Logic Transformations
    // Function to generate the CASE statement for binary flags (1 or 0)
     get_status_flag: (ac_status) => `CASE 
        WHEN UPPER(CAST(${ac_status} AS STRING)) IN ('Y', 'YES', 'TRUE', '1') THEN 1 
        ELSE 0 
END`,
    // All raw source columns mapped to target dimension column names
    columns: {
        bed_id: "bed_id",
        bed_category: "bed_category",
        ac_status: "ac_status",
        sharing_capacity: "sharing_capacity",
        operational_status: "operational_status",
        room_number: "room_number",
        floor_number: "floor_number"
    }
};

     

module.exports = {
    source
};
