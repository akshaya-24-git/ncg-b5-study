
// definitions/param/target/dim_diagnosis.js

const target = {
    // Fully qualified physical target table name
     target_table: "diagnosis_dim",

    // Keys used to prevent duplicates and identify unique records
    bk: ["diagnosis_bk"],
    dk: ["diagnosis_dk"],
    
    hashdiff: ["hashdiff"],

    // Complete list of columns in the final target table schema
    columns: [
        "diagnosis_bk",
        "diagnosis_dk",
        "hashdiff",
        "icd10_code",
        "description",
        "clinical_category",
        "chronic_flag",
        "is_hrrp_condition",
        "is_acsc_condition",
        "charlson_comorbidity_group",
        "load_ts"
    ],

    // Columns utilized for the SQL INSERT action
    insert_list: [
        "diagnosis_bk",
        "diagnosis_dk",
        "hashdiff",
        "icd10_code",
        "description",
        "clinical_category",
        "chronic_flag",
        "is_hrrp_condition",
        "is_acsc_condition",
        "charlson_comorbidity_group",
        "load_ts"
    ],

    // Columns utilized for the SQL UPDATE action when data changes
    update_list: [
        "description",
        "clinical_category",
        "chronic_flag",
        "is_hrrp_condition",
        "is_acsc_condition",
        "charlson_comorbidity_group",
        "load_ts"
    ]
};

module.exports = { target };