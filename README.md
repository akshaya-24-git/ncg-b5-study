# NCG B5 Study

## Overview

This repository contains a Dataform-based analytics pipeline built to support patient, date, bridge, and risk score models aligned to an external STTM workbook contract.

The project is structured around:
- `dataform/definitions/dv_table_steps/` for table read/process/write SQLX assets
- `dataform/definitions/param/` for source/target parameter metadata
- `dataform/includes/` for shared helper functions and environment configuration
- `scripts/` for STTM extraction and update orchestration

The STTM workbook itself is intentionally external to the repo and ignored by Git. The pipeline is designed to read STTM definitions without materializing output unless explicitly requested.

## Key Components

### Dataform Assets

The current implementation includes:
- `patient_dim` — patient dimension read/process/write steps
- `date_dim` — calendar dimension generation, holiday/festival enrichment, and date key generation
- `patient_diagnosis_brg` — patient diagnosis bridge table read/process/write steps
- `risk_score_fct` — risk score fact pipeline with STTM-aligned score, tier, and readmission probability logic

Each of these follows a layered pattern:
- `step_tbl_read_*` to read and stage source inputs
- `step_tbl_process_*` to transform and calculate derived fields
- `step_tbl_write_*` to load the final target table

### Parameter Files

Source and target parameter files define the expected business keys, surrogate keys, hash differential columns, and table names used by the Dataform SQLX files.

Example:
- `dataform/definitions/param/source/risk_score_fct.js`

These parameter files are critical because they enable the SQLX layers to be reusable while preserving exact field mappings.

### Shared Helpers

`dataform/includes/functions.js` contains the reusable hash and concatenation helpers used by the models:
- `fn_calculateHash()` for DK and hash_diff values
- `fn_calculateConcat()` for BK values
- pipeline helpers used by write operations

### STTM Pipeline Scripts

The repo includes a non-materializing STTM workflow:
- `scripts/read_sttm.py` — reads an XLSX sheet and prints results by default, only writing files when `--materialize` is set
- `scripts/update_sttm.py` — previews CSV-based workbook updates by default, only persisting changes with `--materialize`
- `scripts/pipeline_sttm.py` — orchestrates extract/update workflows with explicit dry-run behavior

This design is intentionally safe: the default behavior is extraction or preview only, avoiding accidental output.

## What Was Built

### Patient Dimension

The patient dimension implementation was built to:
- read active patient source keys
- normalize business key prefixes
- generate stable dimension keys
- preserve the expected target column list via parameter-driven metadata

### Date Dimension

The date dimension implementation generates a calendar grid and enriches it with the external reference data. It includes:
- full date and calendar components
- fiscal year logic
- weekend, holiday, and festival flags
- `date_dk` and `full_date` business key construction

### Patient Diagnosis Bridge

The bridge table implementation was designed to:
- connect patient diagnosis records to patients
- expose diagnosis-level clinical flags and comorbidity metadata
- serve as the source anchor for the risk score fact

### Risk Score Fact

The risk score fact pipeline now includes:
- multi-source extraction from patient, date, bridge, encounter, and claim data
- STTM-style composite score normalization
- tier mapping to Low/Medium/High/Critical
- logistic readmission probability using STTM coefficients
- hash_diff generation and SCD2 metadata fields

## What Worked Well

The agentic workflow successfully:
- created read/process/write SQLX scaffolds for multiple tables
- mapped STTM concepts into reusable Dataform patterns
- preserved the repo template style for `step_tbl_*` files
- built parameter-driven source/target metadata files
- introduced a safe non-materializing STTM pipeline
- validated the resulting SQLX and script files for syntax errors

## Where Things Mismatched

### Inference versus exact STTM contract

The primary mismatches came from assumptions made during generation:
- early `risk_score_fct` logic used placeholder scoring heuristics instead of the exact STTM formula
- `date_dim` was adjusted into a template-like pattern before the exact STTM DK/BK and field semantics were clarified
- some source-to-target mappings were inferred rather than driven by an explicitly shared workbook sheet
- the pipeline initially tried to follow CTE-based staging but then detoured to simpler `SELECT ... FROM` patterns, losing intended read/process separation
- surrogate key (`dk`) and business key (`bk`) logic diverged from the STTM definitions, creating mismatch risk in deduplication and joins
- the generated pipeline assumed data completeness and did not initially guard against missing patient/date/diagnosis/claim combinations
- the model defaulted to scaffold construction because prompt guidance emphasized structure over exact STTM contract details

### User prompt ambiguity

The agent can build a lot from a template, but it needs exact contract details to avoid mismatches.
Missing or high-level guidance caused the model to:
- create generic staging layers instead of exact business transforms
- omit the original STTM field order or naming intent
- choose default naming conventions rather than the user’s specific schema

### Environment and materialization

The original script behavior wrote output by default. That was a risk because STTM assets and CSV extracts should not be materialized unless explicitly requested. This has now been fixed.

## What Could Be Improved

### For future agent-assisted table construction

1. Provide exact STTM rows and formulas in the prompt.
   - list column names, data types, business keys, and derived logic explicitly.

2. Keep a single source of truth in the repo.
   - store an STTM metadata file or YAML manifest in `dataform/` so the agent can read it directly.

3. Use explicit prompt structure:
   - "Create read/process/write files for this target table using these exact columns, keys, and formula definitions." 
   - "Do not materialize files unless I pass `--materialize`."

4. Add compile and regression validation.
   - a project-level `dataform compile` or SQL validation step would catch mismatches earlier.
   - unit test small sample transforms if possible.

5. Standardize parameter meta files.
   - include explicit `dk`, `bk`, `hash_diff`, `columns`, `insert_list`, and `update_list` in every param file.
   - this reduces inference errors during generation.

## Where the agent slipped

The agent’s main slips were:
- over-generalizing the date dimension and score logic instead of sticking strictly to the STTM contract
- using heuristic values and placeholders in early versions of the risk score fact
- generating a wider script file set than needed, then requiring cleanup
- detouring from the intended CTE-based read/process/write pattern into simpler select-from structures
- making DK/BK assumptions without exact STTM formulas, which introduced key mismatches
- assuming the STTM source data was complete and therefore missing early null-handling and outer-join robustness
- treating the project as a generic scaffold instead of a strict contract-driven build

These were not failures of the repository; they were the natural result of asking the agent to infer STTM intent from a template and partial examples.

## What the user could improve when prompting

From the user side, the best prompt would include:
- the exact target table schema and field list
- the exact formula definitions, including any coefficients or thresholds
- the desired file/template naming conventions
- clear instructions about materialization behavior
- a note that workbook and CSV outputs are ignored by Git and should only be created on request

Saying "use my STTM, not your own heuristics" is helpful, but the strongest signal is an explicit row-by-row contract and a request to preserve exact column semantics.

## Current Project Status

- `dataform/definitions/dv_table_steps/` contains patient, date, bridge, and risk score pipelines.
- `dataform/definitions/param/` contains source metadata files, including `risk_score_fct.js`.
- `dataform/includes/functions.js` provides shared hash and key helpers.
- `scripts/` now contains a safe STTM pipeline with dry-run default behavior.

## Recommended Next Actions

1. Review the STTM workbook and confirm exact field names and formulas.
2. Add a repo-native STTM manifest file so the agent can read it directly.
3. Add a `dataform compile` validation step.
4. If you want, I can now update the README with exact command examples and add a repo-level `CONTRIBUTING.md` for future agent prompts.

**DV Table Steps: File-by-file**

- **department_dim**: [dataform/definitions/dv_table_steps/department_dim/step_tbl_read_department_dim.sqlx](dataform/definitions/dv_table_steps/department_dim/step_tbl_read_department_dim.sqlx), [dataform/definitions/dv_table_steps/department_dim/step_tbl_process_department_dim.sqlx](dataform/definitions/dv_table_steps/department_dim/step_tbl_process_department_dim.sqlx), [dataform/definitions/dv_table_steps/department_dim/step_tbl_write_department_dim.sqlx](dataform/definitions/dv_table_steps/department_dim/step_tbl_write_department_dim.sqlx) — Purpose: ingest facility department source, normalize names, generate DK/BK/hash_diff and SCD2-ready columns. State: implemented. Caveats: uses `fn_calculateHash`/`fn_calculateConcat` helpers and SCD2 loader; verify BK order matches STTM.
- **diagnosis_dim**: [dataform/definitions/dv_table_steps/diagnosis_dim/step_tbl_read_diagnosis_dim.sqlx](dataform/definitions/dv_table_steps/diagnosis_dim/step_tbl_read_diagnosis_dim.sqlx), [dataform/definitions/dv_table_steps/diagnosis_dim/step_tbl_process_diagnosis_dim.sqlx](dataform/definitions/dv_table_steps/diagnosis_dim/step_tbl_process_diagnosis_dim.sqlx), [dataform/definitions/dv_table_steps/diagnosis_dim/step_tbl_write_diagnosis_dim.sqlx](dataform/definitions/dv_table_steps/diagnosis_dim/step_tbl_write_diagnosis_dim.sqlx) — Purpose: canonical diagnosis dimension (ICD codes, descriptions, groupings). State: files exist but are empty/placeholders. Action: implement transforms and param-driven keys.
- **doctor_dim**: [dataform/definitions/dv_table_steps/doctor_dim/step_tbl_read_doctor_dim.sqlx](dataform/definitions/dv_table_steps/doctor_dim/step_tbl_read_doctor_dim.sqlx), [dataform/definitions/dv_table_steps/doctor_dim/step_tbl_process_doctor_dim.sqlx](dataform/definitions/dv_table_steps/doctor_dim/step_tbl_process_doctor_dim.sqlx), [dataform/definitions/dv_table_steps/doctor_dim/step_tbl_write_doctor_dim.sqlx](dataform/definitions/dv_table_steps/doctor_dim/step_tbl_write_doctor_dim.sqlx) — Purpose: ingest doctor master data, normalize names/specialty, generate DK/BK/hash, and load (SCD1 in current write). State: implemented. Caveats: write uses SCD1 loader; confirm desired SCD behavior.
- **insurance_plan_dim**: [dataform/definitions/dv_table_steps/insurance_plan_dim/step_tbl_read_insurance_plan_dim.sqlx](dataform/definitions/dv_table_steps/insurance_plan_dim/step_tbl_read_insurance_plan_dim.sqlx), [dataform/definitions/dv_table_steps/insurance_plan_dim/step_tbl_process_insurance_plan_dim.sqlx](dataform/definitions/dv_table_steps/insurance_plan_dim/step_tbl_process_insurance_plan_dim.sqlx), [dataform/definitions/dv_table_steps/insurance_plan_dim/step_tbl_write_insurance_plan_dim.sqlx](dataform/definitions/dv_table_steps/insurance_plan_dim/step_tbl_write_insurance_plan_dim.sqlx) — Purpose: canonical payer/plan table with de-duping and load_ts. State: implemented. Caveats: uses QUALIFY for latest per (payer_id, plan_id, fee_year); verify fee_schedule_year semantics.
- **order_type_dim**: [dataform/definitions/dv_table_steps/order_type_dim/step_tbl_read_order_type_dim.sqlx](dataform/definitions/dv_table_steps/order_type_dim/step_tbl_read_order_type_dim.sqlx), [dataform/definitions/dv_table_steps/order_type_dim/step_tbl_process_order_type_dim.sqlx](dataform/definitions/dv_table_steps/order_type_dim/step_tbl_process_order_type_dim.sqlx), [dataform/definitions/dv_table_steps/order_type_dim/step_tbl_write_order_type_dim.sqlx](dataform/definitions/dv_table_steps/order_type_dim/step_tbl_write_order_type_dim.sqlx) — Purpose: standardize order/ref codes, generate keys and load_ts. State: implemented. Caveats: uses `fn_calculateHash`/`fn_calculateConcat`; confirm source field names.
- **insurance_plan_dim**: (listed above)
- **patient_diagnosis_brg**: [dataform/definitions/dv_table_steps/patient_diagnosis_brg/step_tbl_read_patient_diagnosis_brg.sqlx](dataform/definitions/dv_table_steps/patient_diagnosis_brg/step_tbl_read_patient_diagnosis_brg.sqlx), [dataform/definitions/dv_table_steps/patient_diagnosis_brg/step_tbl_process_patient_diagnosis_brg.sqlx](dataform/definitions/dv_table_steps/patient_diagnosis_brg/step_tbl_process_patient_diagnosis_brg.sqlx), [dataform/definitions/dv_table_steps/patient_diagnosis_brg/step_tbl_write_patient_diagnosis_brg.sqlx](dataform/definitions/dv_table_steps/patient_diagnosis_brg/step_tbl_write_patient_diagnosis_brg.sqlx) — Purpose: bridge patient ↔ diagnosis with SCD2 metadata, DK/BK, hash_diff and load_ts. State: implemented. Caveats: ensures `patient_fk` / `diagnosis_fk` mapping; validate referential keys exist in target dims.
- **patient_dim**: [dataform/definitions/dv_table_steps/patient_dim/step_tbl_read_patient_dim.sqlx](dataform/definitions/dv_table_steps/patient_dim/step_tbl_read_patient_dim.sqlx), [dataform/definitions/dv_table_steps/patient_dim/step_tbl_process_patient_dim.sqlx](dataform/definitions/dv_table_steps/patient_dim/step_tbl_process_patient_dim.sqlx), [dataform/definitions/dv_table_steps/patient_dim/step_tbl_write_patient_dim.sqlx](dataform/definitions/dv_table_steps/patient_dim/step_tbl_write_patient_dim.sqlx) — Purpose: canonical patient master, BK/DK/hash and SCD2 load. State: implemented. Caveats: earlier iterations inferred fields; confirm full STTM column list.
- **date_dim**: [dataform/definitions/dv_table_steps/date_dim/step_tbl_read_date_dim.sqlx](dataform/definitions/dv_table_steps/date_dim/step_tbl_read_date_dim.sqlx), [dataform/definitions/dv_table_steps/date_dim/step_tbl_process_date_dim.sqlx](dataform/definitions/dv_table_steps/date_dim/step_tbl_process_date_dim.sqlx), [dataform/definitions/dv_table_steps/date_dim/step_tbl_write_date_dim.sqlx](dataform/definitions/dv_table_steps/date_dim/step_tbl_write_date_dim.sqlx) — Purpose: calendar grid generation, fiscal/week flags, holiday enrichment, `date_dk` generation. State: implemented. Caveats: confirm `date_dk` concatenation order and holiday source mapping.
- **risk_score_fct**: [dataform/definitions/dv_table_steps/risk_score_fct/step_tbl_read_risk_score_fct.sqlx](dataform/definitions/dv_table_steps/risk_score_fct/step_tbl_read_risk_score_fct.sqlx), [dataform/definitions/dv_table_steps/risk_score_fct/step_tbl_process_risk_score_fct.sqlx](dataform/definitions/dv_table_steps/risk_score_fct/step_tbl_process_risk_score_fct.sqlx), [dataform/definitions/dv_table_steps/risk_score_fct/step_tbl_write_risk_score_fct.sqlx](dataform/definitions/dv_table_steps/risk_score_fct/step_tbl_write_risk_score_fct.sqlx) — Purpose: produce STTM-aligned risk score fact: composite score, tier mapping, logistic readmit probability, DK/BK/hash, SCD2 metadata. State: implemented (replaced early placeholders). Caveats: verify coefficients and normalization against the STTM workbook.
- **doctor_schedule_fct**: [dataform/definitions/dv_table_steps/doctor_schedule_fct/step_tbl_read_doctor_schedule_fct.sqlx](dataform/definitions/dv_table_steps/doctor_schedule_fct/step_tbl_read_doctor_schedule_fct.sqlx), [dataform/definitions/dv_table_steps/doctor_schedule_fct/step_tbl_process_doctor_schedule_fct.sqlx](dataform/definitions/dv_table_steps/doctor_schedule_fct/step_tbl_process_doctor_schedule_fct.sqlx), [dataform/definitions/dv_table_steps/doctor_schedule_fct/step_tbl_write_doctor_schedule_fct.sqlx](dataform/definitions/dv_table_steps/doctor_schedule_fct/step_tbl_write_doctor_schedule_fct.sqlx) — Purpose: roll up doctor schedules into a fact for capacity/utilization reporting. State: implemented. Caveats: check timezone handling and shift boundary logic.
- **ancillary_order_fct**: [dataform/definitions/dv_table_steps/ancillary_order_fct/step_tbl_read_ancillary_order_fct.sqlx](dataform/definitions/dv_table_steps/ancillary_order_fct/step_tbl_read_ancillary_order_fct.sqlx), [dataform/definitions/dv_table_steps/ancillary_order_fct/step_tbl_process_ancillary_order_fct.sqlx](dataform/definitions/dv_table_steps/ancillary_order_fct/step_tbl_process_ancillary_order_fct.sqlx), [dataform/definitions/dv_table_steps/ancillary_order_fct/step_tbl_write_ancillary_order_fct.sqlx](dataform/definitions/dv_table_steps/ancillary_order_fct/step_tbl_write_ancillary_order_fct.sqlx) — Purpose: ancillary orders fact (imaging/lab/etc.) for utilization and cost analysis. State: implemented. Caveats: validate cost mappings and null-handling for optional fields.
- **service_stage_dim**: [dataform/definitions/dv_table_steps/service_stage_dim/step_tbl_read_service_stage_dim.sqlx](dataform/definitions/dv_table_steps/service_stage_dim/step_tbl_read_service_stage_dim.sqlx), [dataform/definitions/dv_table_steps/service_stage_dim/step_tbl_process_service_stage_dim.sqlx](dataform/definitions/dv_table_steps/service_stage_dim/step_tbl_process_service_stage_dim.sqlx), [dataform/definitions/dv_table_steps/service_stage_dim/step_tbl_write_service_stage_dim.sqlx](dataform/definitions/dv_table_steps/service_stage_dim/step_tbl_write_service_stage_dim.sqlx) — Purpose: standardize service stage/reference lookup table. State: implemented. Caveats: confirm desired SCD behavior.
- **bed_dim**: [dataform/definitions/dv_table_steps/bed_dim/step_tbl_read_bed_dim.sqlx](dataform/definitions/dv_table_steps/bed_dim/step_tbl_read_bed_dim.sqlx), [dataform/definitions/dv_table_steps/bed_dim/step_tbl_process_bed_dim.sqlx](dataform/definitions/dv_table_steps/bed_dim/step_tbl_process_bed_dim.sqlx), [dataform/definitions/dv_table_steps/bed_dim/step_tbl_write_bed_dim.sqlx](dataform/definitions/dv_table_steps/bed_dim/step_tbl_write_bed_dim.sqlx) — Purpose: bed-level master reference for capacity and occupancy joins. State: implemented. Caveats: validate facility/ward FK mappings.
- **wait_event_fct**: [dataform/definitions/dv_table_steps/wait_event_fct/step_tbl_read_wait_event_fct.sqlx](dataform/definitions/dv_table_steps/wait_event_fct/step_tbl_read_wait_event_fct.sqlx), [dataform/definitions/dv_table_steps/wait_event_fct/step_tbl_process_wait_event_fct.sqlx](dataform/definitions/dv_table_steps/wait_event_fct/step_tbl_process_wait_event_fct.sqlx), [dataform/definitions/dv_table_steps/wait_event_fct/step_tbl_write_wait_event_fct.sqlx](dataform/definitions/dv_table_steps/wait_event_fct/step_tbl_write_wait_event_fct.sqlx) — Purpose: captures wait/throughput event timelines for flow analysis. State: implemented. Caveats: ensure event timestamps are consistently cast and qualified.

Notes:
- "Implemented" indicates the three-layer read/process/write SQLX assets are present and contain transformation logic; "empty/placeholders" marks files needing implementation.
- Validate BK/DK/hash order and the parameter files under `dataform/definitions/param/` before materializing to ensure STTM contract fidelity.
- If you want, I can (1) open any specific step file and extract the exact column lists, or (2) convert this section into a separate CONTRIBUTING.md and commit it.
