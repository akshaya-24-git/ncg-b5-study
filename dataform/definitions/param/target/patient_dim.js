// This file defines the structure and properties of the final target table.
// The 'write' step imports this object to know where and what to load.

const target = {
    // The name of the final table in your data warehouse.
    target_table: "patient_dim",

    // The business key used to identify unique records and prevent duplicates.
    bk: ["ptnt_bk"],

    natural_key: "ptnt_bk",

    // Surrogate key for the dimension
    dk: ["ptnt_dk"],

    // Hash difference column
    hash_dif: "hash_diff",

    // The complete list of all columns in the final target table.
    // This array is essential for the fn_scd2Load function to work correctly.
    columns: [
        "ptnt_dk",
        "ptnt_bk",
        "patient_id",
        "first_name",
        "last_name",
        "dob",
        "gender",
        "hash_diff",
        "addr_city",
        "addr_state",
        "zip_code",
        "primary_language",
        "risk_tier",
        "valid_from_ts",
        "valid_to_ts",
        "current_ind",
        "load_ts",
        "effective_from_dt",
        "effective_to_dt"
    ],

    // List of columns for the INSERT operation
    insert_list: [
        "ptnt_dk",
        "ptnt_bk",
        "patient_id",
        "first_name",
        "last_name",
        "dob",
        "gender",
        "hash_diff",
        "addr_city",
        "addr_state",
        "zip_code",
        "primary_language",
        "risk_tier",
        "valid_from_ts",
        "valid_to_ts",
        "current_ind",
        "load_ts",
        "effective_from_dt",
        "effective_to_dt"
    ],

    // List of columns for the UPDATE operation
    update_list: [
        "ptnt_bk",
        "patient_id",
        "first_name",
        "last_name",
        "dob",
        "gender",
        "addr_city",
        "addr_state",
        "zip_code",
        "primary_language",
        "risk_tier",
        "effective_from_dt",
        "effective_to_dt"
    ],

    target_dataset: "b5_HIS_t"
};

// Export the target object so other files can import and use it.
module.exports = { target };