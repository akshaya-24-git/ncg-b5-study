const source = {
    // Data Key: A composite primary key for the source record.
    dk: [
        "'MTRXB5'",
        "full_date",
        "fiscal_year"
    ],
    // Business Key:
    bk: [
        "full_date"
    ],

    // Incremental Load Column: 
    //source_incr_load_column: "wt_timestamps",
    // Full Read Flag:
    source_full_read_flag: "Y",

    // MODIFIED: Define source tables here
    source_table_reference_date: "DATE_REF",

    // Stage table and target table names.
    stage_table: "step_tbl_process_date_dim",
    target_table: "date_dim"
};

module.exports = { source };
