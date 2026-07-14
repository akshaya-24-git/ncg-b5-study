const source = {
    dk: [
        "'MTRXB5'",
        "encounter_dk",
        "event_id",
        "CURRENT_TIMESTAMP()"
    ],
    bk: [
        "'MTRXB5'",
        "encounter_dk",
        "event_id"
    ],
    hash_diff: [
        "order_status",
        "order_placed_datetime",
        "results_ready_datetime",
        "turnaround_mins"
    ],
    source_full_read_flag: "Y",
    source_table_event: "EHR_EVENT",
    source_table_encounter: "ENCOUNTER_FCT",
    source_filter: "WHERE event_type IN ('ANCILLARY_ORDER', 'ancillary_type')"
};

module.exports = {
    source
};