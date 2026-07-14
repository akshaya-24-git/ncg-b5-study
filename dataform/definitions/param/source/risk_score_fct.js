const source = {
    dk: [
        "'MTRXB5'",
        "patient_fk",
        "scoring_date_fk",
        "CURRENT_TIMESTAMP()"
    ],
    bk: [
        "'MTRXB5'",
        "patient_fk",
        "scoring_date_fk"
    ],
    hash_diff: [
        "risk_score",
        "risk_tier",
        "readmit_probability",
        "comorbidity_count",
        "chronic_disease_flag",
        "prior_admissions_12m",
        "ed_visits_12m",
        "claims_utilization_12m",
        "scoring_model_version"
    ],
    source_tables: [
        {
            alias: "patient_dim_src",
            table_name: "patient_dim",
            select_columns: [
                "ptnt_bk AS patient_fk"
            ]
        },
        {
            alias: "date_dim_src",
            table_name: "date_dim",
            select_columns: [
                "date_dk AS scoring_date_fk",
                "full_date AS scoring_date"
            ]
        },
        {
            alias: "bridge_src",
            table_name: "patient_diagnosis_brg",
            select_columns: [
                "bridge_bk AS bridge_fk",
                "bridge_dk",
                "chronic_flag AS chronic_disease_flag"
            ]
        },
        {
            alias: "encounter_src",
            table_name: "encounter_fct",
            select_columns: [
                "encounter_type",
                "encounter_id"
            ]
        },
        {
            alias: "claim_src",
            table_name: "claim_fct",
            select_columns: [
                "paid_amount AS claims_utilization_12m"
            ]
        }
    ],
    stage_table: "step_tbl_process_risk_score_fct",
    target_table: "risk_score_fct"
};

module.exports = { source };
