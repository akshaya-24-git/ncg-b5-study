
const source = {
    // 1. Dimensional Key (DK) Components used for unique hash generation
    dk: [
        "'MTRXB5'", // System tenant/source identifier
        "'~'",
        "payer_id", 
        "plan_id", 
        "fee_schedule_year",
        "CAST(CURRENT_TIMESTAMP() AS STRING)"
    ],

    // 2. Business Key (BK) Components representing the natural keys
    bk: [
        "'MTRXB5'", // System tenant/source identifier
        "payer_id", 
        "plan_id", 
        "fee_schedule_year",
    ],

    // 3. Attribute columns monitored for changes (SCD Type 2 tracking)
    // These columns are passed to fn_calculateHash to populate the hashdiff column
    hash_diff: [
        "payer_id",
        "payer_name",
        "plan_name",
        "plan_type_code",
        "network_type",
        "fee_schedule_year",
        "coverage_tier"
    ],

    // Metadata Properties matching your dataset layout
    table_name: "INS_PLAN",
    source_table: "INS_PLAN",
    stage_table: "step_tbl_process_insurance_plan_dim",
    target_table: "INSURANCE_PLAN_DIM"
};

module.exports = { source };