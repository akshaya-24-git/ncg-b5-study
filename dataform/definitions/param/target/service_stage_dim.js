let { 
    datasets,
    projectConfig
} = require("includes/glb_env.js");

const target = {
    stage_table: `${projectConfig.projectName}.${datasets.staging}.step_tbl_process_service_stage_dim`,
    target_table: "service_stage_dim",
    dk: ["srv_stage_dk"],
    bk: ["srv_stage_bk"],
    hash_diff: ["hash_diff"],
    columns: [
        "srv_stage_dk",
        "srv_stage_bk",
        "hash_diff",
        "srv_name",
        "high_lvl_stage",
        "care_set",
        "sla_wait_threshold",
        "load_ts"
    ],
    insert_list: [
        "srv_stage_dk",
        "srv_stage_bk",
        "hash_diff",
        "srv_name",
        "high_lvl_stage",
        "care_set",
        "sla_wait_threshold",
        "load_ts"
    ],
    update_list: [
        "srv_name",
        "high_lvl_stage",
        "care_set",
        "sla_wait_threshold",
        "load_ts"
    ]
};

module.exports = { target };