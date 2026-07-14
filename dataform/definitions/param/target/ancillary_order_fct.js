let { 
    datasets,
    projectConfig
} = require("includes/glb_env.js");

const target = {
    stage_table: `${projectConfig.projectName}.${datasets.staging}.step_tbl_process_ancillary_order_fct`,
    target_table: "ancillary_order_fct",
    dk: ["order_dk"],
    bk: ["order_bk"],
    hash_diff: ["hash_diff"],
    columns: [
        "order_dk",
        "order_bk",
        "encounter_bk",
        "ptnt_bk",
        "ordering_doc_bk",
        "facility_bk",
        "dept_bk",
        "order_type_bk",
        "order_date_bk",
        "order_placed_datetime",
        "results_ready_datetime",
        "turnaround_mins",
        "order_status",
        "load_ts",
        "hash_diff"
    ],
    insert_list: [
        "order_dk",
        "order_bk",
        "encounter_bk",
        "ptnt_bk",
        "ordering_doc_bk",
        "facility_bk",
        "dept_bk",
        "order_type_bk",
        "order_date_bk",
        "order_placed_datetime",
        "results_ready_datetime",
        "turnaround_mins",
        "order_status",
        "load_ts",
        "hash_diff"
    ],
    update_list: [
        "encounter_bk",
        "ptnt_bk",
        "ordering_doc_bk",
        "facility_bk",
        "dept_bk",
        "order_type_bk",
        "order_date_bk",
        "order_placed_datetime",
        "results_ready_datetime",
        "turnaround_mins",
        "order_status",
        "load_ts"
    ]
};

module.exports = { target };