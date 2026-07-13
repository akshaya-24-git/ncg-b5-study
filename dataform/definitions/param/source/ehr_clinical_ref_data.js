//param/src/ehr_clinical_ref_data

const source = {
    dk:[
        "'MTRXB5'",
        "ref_code",
        "CURRENT_TIMESTAMP"
    ],

    bk:[
        "'MTRXB5'",
        "ref_code"
    ],
    hash_diff_1: [
    "ord_name",
    "ord_cat",
    "ord_sub_cat",
    "turnaround_mins"
    ],
    hash_diff_2: [
        "ref_name",
        "high_level_stage",
        "care_setting",
        "sla_threshold_mins"
    ],
    source_full_read_flag: "Y",
    source_table: "EHR_CLINICAL_REF_DATA"
};

const service_stage_source = {
    dk: [
        "'MTRXB5'",
        "ref_code",
        "CURRENT_TIMESTAMP"
    ],
    bk: [
        "'MTRXB5'",
        "ref_code"
    ],
    hash_diff: [
        "ref_name",
        "high_level_stage",
        "care_setting",
        "sla_threshold_mins"
    ],
    source_full_read_flag: "Y",
    source_table: "EHR_CLINICAL_REF_DATA"
};

module.exports = {
    source,
    service_stage_source
};