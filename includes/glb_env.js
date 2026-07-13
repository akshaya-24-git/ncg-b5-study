// includes/glb_env.js

const projectConfig = {
    projectName: "fy23-asc-addg-dataverse",
};


// 1. Centralized Dataset Mapping Object
const datasets = {
  source: "b5_HIS",
  staging: "b5_HIS_stg",
  target: "b5_HIS_t",
  assertions: "b5_assertions_data"
};

// 2. Workspace Status Tracker
// Grabs the workspace name if running locally, otherwise defaults to production environment
const currentWorkspace = dataform.projectConfig.vars.env || "prod";

/**
 * Helper function to generate standardized descriptions/metadata for your table documentation
 * @param {string} developerName - The developer who owns the file
 * @param {string} description - The plain text table description from the STTM
 */
function getTableMetadata(developerName, description) {
  return {
    developer_owner: developerName,
    environment: currentWorkspace,
    business_description: description
  };
}

module.exports = { 
  projectConfig,
  datasets, 
  currentWorkspace,
  getTableMetadata 
};