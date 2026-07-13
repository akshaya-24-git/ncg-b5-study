let { 
    datasets,
    projectConfig
} = require("includes/glb_env.js");

const target = {
    stage_table: `${projectConfig.projectName}.${datasets.staging}.step_tbl_process_order_type_dim`,
    target_table: "order_type_dim",
    dk: ["ord_type_dk"],
    bk: ["ord_type_bk"],
    hash_diff: ["hash_diff"],
    columns: [
        "ord_type_dk",
        "ord_type_bk",
        "hash_diff",
        "ord_name",
        "ord_cat",
        "ord_sub_cat",
        "turnaround_mins",
        "load_ts"
    ],
    insert_list: [
        "ord_type_dk",
        "ord_type_bk",
        "hash_diff",
        "ord_name",
        "ord_cat",
        "ord_sub_cat",
        "turnaround_mins",
        "load_ts"
    ],
    update_list: [
        "ord_name",
        "ord_cat",
        "ord_sub_cat",
        "turnaround_mins"
    ]
};

module.exports = { target };