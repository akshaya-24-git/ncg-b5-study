let {
    datasets,
    projectConfig
} = require("includes/glb_env.js");

const target = {
    stage_table: `${projectConfig.projectName}.${datasets.staging}.step_tbl_process_department_dim`,
    target_table: "department_dim",

    dk: ["dept_dk"],

    bk: ["dept_bk"],

    hash_diff: ["hash_diff"],

    insert_list: [
        "dept_dk",
        "dept_bk",
        "hash_diff",
        "dept_name",
        "dept_type",
        "dept_head_doc_code",
        "capacity",
        "current_ind",
        "valid_from_ts",
        "valid_to_ts",
        "load_ts"
    ],

    update_list: [
        "hash_diff",
        "dept_name",
        "dept_type",
        "dept_head_doc_code",
        "capacity",
        "current_ind",
        "valid_from_ts",
        "valid_to_ts",
        "load_ts"
    ]
};

module.exports = { target };
