// definitions/params/target_dim_date_params.js
// This file defines the static metadata structure for the final dim_date target table.

const target = {
    // The name of the final table in your b5_HIS_t target data warehouse.
    target_table: "date_dim",

    // THE unique dimension key to the final dimension table
    dk: ["date_dk"],

    // The unique Business Key (Primary Key) for calendar integrity.
    bk: ["full_date"],

    // The complete list of all destination columns mapped out in your STTM.
    // This array is used by your central functions to structure the final SELECT statement.
    columns: [
        "date_dk",
        "full_date",
        "day_of_week",
        "day_of_week_num",
        "week_of_year",
        "month_num",
        "month_name",
        "quarter_num",
        "year_num",
        "fiscal_year",
        "is_weekend",
        "is_holiday",
        "is_festival"
    ],

    // Since this is a static reference table, it performs an absolute load.
    // We only expose a clean insert_list to populate all properties simultaneously.
    insert_list: [
        "date_dk",
        "full_date",
        "day_of_week",
        "day_of_week_num",
        "week_of_year",
        "month_num",
        "month_name",
        "quarter_num",
        "year_num",
        "fiscal_year",
        "is_weekend",
        "is_holiday",
        "is_festival"
    ]
};

// Export the target object so your dynamic write framework can read it
module.exports = { target };