const target = {
    target_table: "wait_event_fct",
    dk: ["wait_event_time_dk"],
    bk: ["wait_event_time_bk"],
    columns: [
        "wait_event_time_dk",
        "wait_event_time_bk",
        "event_sequence",
        "encounter_fk",
        "doc_fk",
        "ptnt_fk",
        "facility_fk",
        "dept_fk",
        "srv_stage_fk",
        "event_date_fk",
        "service_start_time",
        "actual_service_start_time",
        "service_end_time",
        "service_duration_mins",
        "wait_duration_mins",
        "breach_flag",
        "load_ts"
    ],
    insert_list: [
        "wait_event_time_dk",
        "wait_event_time_bk",
        "event_sequence",
        "encounter_fk",
        "doc_fk",
        "ptnt_fk",
        "facility_fk",
        "dept_fk",
        "srv_stage_fk",
        "event_date_fk",
        "service_start_time",
        "actual_service_start_time",
        "service_end_time",
        "service_duration_mins",
        "wait_duration_mins",
        "breach_flag",
        "load_ts"
    ],
    update_list: [
        "wait_event_time_dk",
        "wait_event_time_bk",
        "event_sequence",
        "encounter_fk",
        "doc_fk",
        "ptnt_fk",
        "facility_fk",
        "dept_fk",
        "srv_stage_fk",
        "event_date_fk",
        "service_start_time",
        "actual_service_start_time",
        "service_end_time",
        "service_duration_mins",
        "wait_duration_mins",
        "breach_flag",
        "load_ts"
    ]
}

module.exports = {
    target
}
