let { 
    datasets,
    projectConfig
} = require("includes/glb_env.js");

[
    "date_dim", 
    "doctor_dim",
    "department_dim",
    "patient_dim", 
    "order_type_dim", 
    "service_stage_dim",
    "bed_dim",
    "patient_diagnosis_brg",
    "facility_dim",
    "diagnosis_dim",
    "facility_fct",
    "wait_event_fct",
    "ancillary_order_fct",
    "encounter_fct",
    "doctor_schedule_fct",
    "risk_score_fct",
    "claim_fct"
].forEach((name) =>
declare({
    database: projectConfig.projectName,
    schema: datasets.target,
    name
})

);