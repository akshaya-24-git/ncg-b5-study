// Import your centralized environment configuration
const glb_env = require("includes/glb_env");

// All 14 raw staging source tables extracted from your b5_HIS dataset screenshot
const sourceTables = [
  "DATE_REF",
  "EHR_BED",
  "EHR_BED_OCCUPANCY",
  "EHR_CLINICAL_REF_DATA",
  "EHR_DIAGNOSIS",
  "EHR_DOCTOR",
  "EHR_EVENT",
  "EHR_FACILITY_DEPT",
  "EHR_PATIENT",
  "EHR_PATIENT_DIAGNOSIS",
  "EHR_VISIT",
  "HR_SCHEDULE",
  "INS_CLAIM_DETAIL",
  "INS_PLAN",
];

// Dynamically declare every source table using your glb_env configurations
sourceTables.forEach((tableName) => {
  declare({
    database: glb_env.projectConfig.projectName, // Resolves to "fy23-asc-addg-dataverse"
    schema: glb_env.datasets.source,             // Resolves to "b5_HIS"
    name: tableName,
    description: `Raw staging source table: ${tableName}. Managed externally.`
  });
});