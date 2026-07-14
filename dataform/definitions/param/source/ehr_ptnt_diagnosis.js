const source = {
    // Data Key: A composite primary key for the source record.
    dk: [
        "'MTRXB5'",
        "patient_fk",
        "diagnosis_fk",
        "last_updated"
    ],
    // Business Key:
    bk: [
        "'MTRXB5'",
        "patient_fk",
        "diagnosis_fk"
    ],
    // Hash Difference: Columns used to detect changes.
    hash_diff: [
        "diagnosis_type",
        "onset_date",
        "resolution_date",
        "is_active"
    ],
    // Incremental Load Column:
    // source_incr_load_column: "wt_timestamps",
    // Full Read Flag:
    source_full_read_flag: "Y",

    // Define the source table here.
    source_table_brg: "EHR_PATIENT_DIAGNOSIS",

    // Stage table and target table names.
    stage_table: "step_tbl_process_patient_diagnosis_brg",
    target_table: "patient_diagnosis_brg"
};

module.exports = {
    source
};
