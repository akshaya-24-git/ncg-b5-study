let { 
    datasets,
    projectConfig
} = require("includes/glb_env.js");

const target = {
  
    stage_table: `${projectConfig.projectName}.${datasets.staging}.step_tbl_process_doctor_dim`,
    target_table: "doctor_dim",

  
    dk: ["doc_dk"],

    bk: ["doc_bk"],


    hash_diff : ["hash_diff"],

    insert_list: [
        "doc_dk",
        "doc_bk",
        "hash_diff",
        "npi_number",
        "first_name",
        "last_name",
        "speciality",
        "sub_speciality",
        "emp_type",
        "hourly_rate",
        "current_ind",
        "valid_from_ts",
        "valid_to_ts",
        "load_ts"
    ],

    update_list: [
        "hash_diff",
        "npi_number",
        "first_name",
        "last_name",
        "speciality",
        "sub_speciality",
        "emp_type",
        "hourly_rate",
        "current_ind",
        "valid_from_ts",
        "valid_to_ts",
        "load_ts"
    ]

};

module.exports = { target };