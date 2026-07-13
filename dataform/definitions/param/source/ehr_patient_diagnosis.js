const source = {
    dk: ["'MTRXB5'", "patient_id", "CURRENT_TIMESTAMP()"],
    bk: ["'MTRXB5'", "patient_id"],
    hash_diff: [
        "diagnosis_type",
        "onset_date"
    ],
    source_table: "EHR_PATIENT_DIAGNOSIS",
    target_table: "patient_diagnosis_brg"
};

module.exports = {
    source
};
