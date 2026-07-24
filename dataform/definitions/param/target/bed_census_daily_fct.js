const source = {
    // 1. Fully qualified physical target table name
    target_table: "bed_census_daily_fct",

    // 2. Dual-element key arrays matching the exact signature of your working doctor fact macro
    bk: [
        "'MTRXB5'",
        "bed_census_bk"
    ],
    dk: [
        "'MTRXB5'",
        "bed_census_dk"
    ],

    // 3. Complete list of columns in the final target table schema
    columns: [
        "bed_census_dk",
        "bed_census_bk",
        "bed_fk",
        "facility_fk",
        "department_fk",
        "patient_fk",
        "occupancy_id",
        "census_date",
        "is_occupied",
        "is_vaccant",
        "is_maintained",
        "is_admitted_today",
        "is_discharge_today",
        "load_ts",
        "hash_diff"
    ],

    // 4. Columns utilized for the SQL INSERT action
    insert_list: [
        "bed_census_dk",
        "bed_census_bk",
        "bed_fk",
        "facility_fk",
        "department_fk",
        "patient_fk",
        "occupancy_id",
        "census_date",
        "is_occupied",
        "is_vaccant",
        "is_maintained",
        "is_admitted_today",
        "is_discharge_today",
        "load_ts",
        "hash_diff"
    ],

    // 5. Columns utilized for the SQL UPDATE action
    update_list: [
        "bed_fk",
        "facility_fk",
        "department_fk",
        "patient_fk",
        "occupancy_id",
        "census_date",
        "is_occupied",
        "is_vaccant",
        "is_maintained",
        "is_admitted_today",
        "is_discharge_today",
        "load_ts",
        "hash_diff"
    ]
};

// Export it as both source and target to cover all framework aliases!
module.exports = { 
    source,
    target: source 
};