const source = {
    source_table: "EHR_EVENT",
    bk: [
        "'MTRX5'",
        "visit_id",
        "event_id"
    ],
    dk: [
        "'MTRX5'",
        "visit_id",
        "event_id",
        "current_timestamp()"   
    ]
}

module.exports = {
    source
}
