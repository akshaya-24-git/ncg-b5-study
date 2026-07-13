const target = {
    target_table: "date_dim",
    bk: ["date_dk"],
    natural_key: "date_dk",
    dk: ["date_dk"],
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
    ],
    update_list: [
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
    target_dataset: "b5_HIS_t"
};

module.exports = { target };