const source = {
    project_id: "fy23-asc-addg-dataverse",
    src_dataset: "b5_HIS",
    table_name: "HR_SCHEDULE",
    target_table: "doctor_schedule_fct",

    dk: [
        "'MTRXB5'",
        "schedule_id"
    ],

    bk: [
        "'MTRXB5'",
        "schedule_id"
    ],

};

module.exports = {
    source
};
