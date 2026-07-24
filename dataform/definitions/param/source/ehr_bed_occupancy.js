const source = {
    // 1. Source Tables (Tracked as Dataform references)
    source_table_bed: "EHR_BED",
    source_table_occupancy: "EHR_BED_OCCUPANCY",

    // 2. Core Architectural Hash Framework Key Configuration Arrays
    dk: [
        '"MTRXB5"',
        "o.occupancy_id",
        "CURRENT_TIMESTAMP()"
    ],

    bk: [
        '"MTRXB5"',
        "o.occupancy_id"
    ],

    // Composite components for Fact Primary Key (SK) Generation
    bed_census_sk: [
        "'MTRXB5'",
        "b.facility_code",
        "b.department_code",
        "o.bed_id",
        "o.patient_id"
    ],
     
    hash_diff: [
        "occupancy_id",
        "is_occupied",
        "is_vaccant",
        "is_maintained",
        "is_admitted_today",
        "is_discharge_today"
    ],


    // 3. Metadata Properties
    target_table: "bed_census_daily_fct"
};

module.exports = {
    source
};