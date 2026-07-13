
const source = {
    // Data Key: A composite primary key for the source record.
    dk: [
        "'MTRXB5'",
        "patient_id",
        "CURRENT_TIMESTAMP()"
    ],
    // Business Key:
    bk: [
        "'MTRXB5'",
        "patient_id"
    ],
    // Hash Difference: Columns used to detect changes.
    hash_diff: [
        "first_name",
        "last_name",
        "dob",
        "gender",
        "addr_city",
        "addr_state",
        "zip_code",
        "primary_language",
        // "risk_tier",
        "effective_from_dt",
        "effective_to_dt"
    ],
    // Incremental Load Column:
    // source_incr_load_column: "wt_timestamps",
    // Full Read Flag:
    source_full_read_flag: "Y",

    //  Define both source tables here
    source_table_patient: "EHR_PATIENT",
    source_table_event: "EHR_EVENT",

    // Stage table and target table names.
    stage_table: "step_tbl_process_ptnt_dim",
    target_table: "patient_dim"
};

module.exports = {
    source
};