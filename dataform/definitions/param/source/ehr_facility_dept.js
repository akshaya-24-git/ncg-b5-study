const source = {
    project_id: "fy23-asc-addg-dataverse",
    src_dataset: "b5_HIS",
    table_name: "EHR_FACILITY_DEPT",
    target_table: "department_dim",

    dk: [
        "'MTRXB5'",
        "department_code",
        "facility_code",
        "current_timestamp()"
    ],

    bk: [
        "'MTRXB5'",
        "department_code",
        "facility_code"
    ],

    hash_diff: [
        "department_code",
        "facility_code",
        "department_name",
        "department_type",
        "dept_capacity"
    ]
};

module.exports = {
    source
};
