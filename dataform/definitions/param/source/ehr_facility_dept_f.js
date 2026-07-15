

// definitions/param/source/ehr_facility_department.js

const source = {
    project_id: "fy23-asc-addg-dataverse",
    src_dataset: "b5_HIS",
    table_name: "EHR_FACILITY_DEPT",

    // Columns used for the Domain Key (Surrogate Key generation)
    dk: [
        "'MTRXB5'",
        "facility_code",
        "last_updated"
    ],

    // Columns used for the Business Key (Natural Key string generation)
    bk: [
        "'MTRXB5'",
        "facility_code"
    ],

    // Target columns tracking delta mutations (excluding keys and timestamps)
    hash_diff: [
        "facility_name",
        "facility_type_code",
        "city",
        "state",
        "region",
        "zip_code",
        "total_licensed_beds"
    ],

    // Mapping raw source table columns to the required target structure
    columns: {
        facility_code: "facility_id",           // Mapping source code to target facility_id
        facility_name: "facility_name",
        facility_type_code: "facility_type",    // Mapping source type_code to target facility_type
        city: "city",
        state: "state",
        region: "region",
        zip_code: "zip_code",
        total_licensed_beds: "total_licensebeds", // Mapping source name to target total_licensebeds
        last_updated: "load_ts"
    }
};

module.exports = {
    source
};


