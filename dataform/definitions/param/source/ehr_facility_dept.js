const source = {
    project_id: "fy23-asc-addg-dataverse",
    src_dataset: "b5_HIS",
    table_name: "EHR_FACILITY_DEPT",
    target_table: "department_dim",

    dk: [
        "'MTRXB5'",
        "department_code"
    ],

    bk: [
        "'MTRXB5'",
        "department_code"
    ],

    hash_diff: [
        "department_name",
        "department_type",
        "dept_capacity",
        "head_doctor_id",
        "state",
        "total_licensed_beds",
        "zip_code",
        "is_dept_active",
        "facility_type_code",
        "region",
        "is_facility_active",
        "facility_name",
        "city",
        "facility_code",
        "last_updated"
    ]
};

module.exports = {
    source
};
