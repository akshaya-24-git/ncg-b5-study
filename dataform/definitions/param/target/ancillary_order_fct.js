let { 
    datasets,
    projectConfig
} = require("includes/glb_env.js");

const target = {
    stage_table: `${projectConfig.projectName}.${datasets.staging}.step_tbl_process_ancillary_order_fct`,
    target_table: "ancillary_order_fct",
    dk: ["order_dk"],
    bk: ["order_bk"],
    columns: [
        "order_dk",
        "order_bk",
        "encounter_fk",
        "ptnt_fk",
        "ordering_doc_fk",
        "facility_fk",
        "dept_fk",
        "order_type_fk",
        "order_date_fk",
        "order_placed_datetime",
        "results_ready_datetime",
        "turnaround_mins",
        "order_status",
        "load_ts"
    ],
    insert_list: [
        "order_dk",
        "order_bk",
        "encounter_fk",
        "ptnt_fk",
        "ordering_doc_fk",
        "facility_fk",
        "dept_fk",
        "order_type_fk",
        "order_date_fk",
        "order_placed_datetime",
        "results_ready_datetime",
        "turnaround_mins",
        "order_status",
        "load_ts"
    ],
    update_list: [
        "encounter_fk",
        "ptnt_fk",
        "ordering_doc_fk",
        "facility_fk",
        "dept_fk",
        "order_type_fk",
        "order_date_fk",
        "order_placed_datetime",
        "results_ready_datetime",
        "turnaround_mins",
        "order_status",
        "load_ts"
    ]
};

module.exports = { target };