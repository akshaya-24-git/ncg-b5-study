// This file defines the structure and properties of the final target table.
// The 'write' step imports this object to know where and what to load.

const target = {
    // The name of the final table in your data warehouse.
    target_table: "facility_dim",

    // The business key used to identify unique records and prevent duplicates.
    bk: ["facility_bk"],

    natural_key: "facility_bk",

    // Surrogate key for the dimension
    dk: ["facility_dk"],

    // Hash difference column
    hashdiff: "hashdiff",

    // The complete list of all columns in the final target table.
    // This array is essential for the fn_scd2Load function to work correctly.
    columns: [
        "facility_dk",
        "facility_bk",
        "hashdiff",
        "facility_id",
        "facility_name",
        "facility_type",
        "facility_full_address",
        "city",
        "state",
        "region",
        "zip_code",
        "total_licensebeds",
        "valid_from_ts",
        "valid_to_ts",
        "current_ind",
        "load_ts"
    ],

    // List of columns for the INSERT operation
    insert_list: [
        "facility_dk",
        "facility_bk",
        "hashdiff",
        "facility_id",
        "facility_name",
        "facility_type",
        "facility_full_address",
        "city",
        "state",
        "region",
        "zip_code",
        "total_licensebeds",
        "valid_from_ts",
        "valid_to_ts",
        "current_ind",
        "load_ts"
    ],

    // List of columns for the UPDATE operation
    update_list: [
        "facility_bk",
        "facility_id",
        "facility_name",
        "facility_type",
        "facility_full_address",
        "city",
        "state",
        "region",
        "zip_code",
        "total_licensebeds"
    ],

    target_dataset: "b5_HIS_t"
};

// Export the target object so other files can import and use it.
module.exports = { target };


