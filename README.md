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
