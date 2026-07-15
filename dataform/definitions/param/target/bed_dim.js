const target = {
  // 1. Core Target Table Metadata
  target_table: "bed_dim",
  natural_key: "bed_bk", 
  hash_column: "hashdiff",

// 2. Target data Key (dk) field name
  dk:[
    "bed_dk"
  ],

  // 3. Target Business Key (BK) field name
  bk: [
    "bed_bk"
  ],

  // 4. Informational attributes checked for changes to trigger an SCD Type 2 split
  hash_columns: [
    "bed_category",
    "ac_status",
    "sharing_capacity",
    "operational_status",
    "room_number",
    "floor_number"
  ],

  // 5. Exact list of columns used for final INSERT operations into the table
  insert_list: [
    "bed_dk",
    "bed_bk",
    "hashdiff",
    "bed_id",
    "bed_category",
    "ac_status",
    "sharing_capacity",
    "operational_status",
    "room_number",
    "floor_number",
    "current_ind",
    "valid_from_ts",
    "valid_to_ts",
    "load_ts"
  ],

  // 5. Metadata columns to update in order to expire the old record (SCD Type 2 logic)
    update_list: [
        "valid_from_ts",
        "valid_to_ts",
        "current_ind",
        "load_ts"
    ]
};

module.exports = { target };