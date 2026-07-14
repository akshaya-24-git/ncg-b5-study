// This file defines the target metadata for the patient diagnosis bridge table.
const target = {
  target_table: "patient_diagnosis_brg",
  target_dataset: "b5_HIS_t",
  dk: ["bridge_dk"],
  bk: ["bridge_bk"],
  hash_dif: "hash_diff",
  columns: [
    "bridge_dk",
    "bridge_bk",
    "patient_fk",
    "diagnosis_fk",
    "diagnosis_type",
    "onset_date",
    "resolution_date",
    "hash_diff",
    "valid_from_ts",
    "valid_to_ts",
    "current_ind",
    "load_ts"
  ],
  insert_list: [
    "bridge_dk",
    "bridge_bk",
    "patient_fk",
    "diagnosis_fk",
    "diagnosis_type",
    "onset_date",
    "resolution_date",
    "hash_diff",
    "valid_from_ts",
    "valid_to_ts",
    "current_ind",
    "load_ts"
  ],
  update_list: [
    "patient_fk",
    "diagnosis_fk",
    "diagnosis_type",
    "onset_date",
    "resolution_date"
  ]
};

module.exports = { target };