
const target = {
  // 1. Core Target Table Metadata
  target_table: "INSURANCE_PLAN_DIM",
  natural_key: "ins_bk", 
  hash_column: "hashdiff",

  dk:[
    "ins_dk"
  ],

  // 2. Target Business Key (BK) field name
  bk: [
    "ins_bk"
  ],

  // 3. Informational attributes checked for changes to trigger an SCD Type 2 split
  hash_columns: [
    "payer_id",
    "payer_name",
    "plan_name",
    "plan_type",
    "coverage_tier",
    "fee_schedule_year",
    "network_type"
  ],

  // 4. Exact list of columns used for final INSERT operations into the table
  insert_list: [
    "ins_dk",
    "ins_bk",
    "hashdiff",
    "payer_id",
    "payer_name",
    "plan_name",
    "plan_type",
    "coverage_tier",
    "fee_schedule_year",
    "network_type",
    "current_ind",
    "valid_from_ts",
    "valid_to_ts",
    "bq_load_ts"
  ],

  // 5. Columns to update if adapting the logic for an SCD Type 1 overwrite option
  update_list: [
    "payer_id",
    "payer_name",
    "plan_name",
    "plan_type",
    "coverage_tier",
    "fee_schedule_year",
    "network_type",
    "hashdiff"
  ]
};

module.exports = { target };