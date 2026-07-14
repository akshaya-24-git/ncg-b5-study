const source = {

    project_id :"fy23-asc-addg-dataverse",
    src_dataset : "b5_HIS",
    table_name : "EHR_DOCTOR",
    target_table: "doctor_dim",

    dk: [
        "'MTRXB5'",
        "doctor_id" 
    ],
  
    bk: [
        "'MTRXB5'",
        "doctor_id",
    ],

    hash_diff: [
        "first_name",
        "last_name",
        "employment_type",
        "hourly_rate"
    ]

};

module.exports = {
    source
};