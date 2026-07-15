
// 2. The Centralized Parameter Configurations
const source = {

    project_id: "fy23-asc-addg-dataverse",
    src_dataset: "b5_HIS",
    table_name: "EHR_DIAGNOSIS",
    
    // Columns used for the Domain Key
    dk: [
        "'MTRXB5'",
        "icd10_code",
        "CURRENT_TIMESTAMP"
    ],
    // Columns used for the Business Key
    bk: [
        "'MTRXB5'",
        "icd10_code"
    ],

    hashdiff: [
        "description",
        "clinical_category",
        "chronic_flag",
        "is_hrrp_condition",
        "is_acsc_condition",
        "charlson_comorbidity_group"
    ],

    // All raw source columns mapped to target dimension column names
    columns: {
        icd10_code: "icd10_code",
        description: "description",
        clinical_category: "clinical_category",
        chronic_flag: "chronic_flag",
        is_hrrp_condition: "is_hrrp_condition",
        is_acsc_condition: "is_acsc_condition",
        charlson_comorbidity_group: "charlson_comorbidity_group",
        is_active: "is_active",
        last_updated: "load_ts" // Mapping source timestamp to target load_ts
    }
};

module.exports = {
    source
};
