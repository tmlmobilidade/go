# GTFS Validator

A high-performance GTFS (General Transit Feed Specification) validation tool written in Go. The validator processes GTFS feeds, applies configurable validation rules, and reports errors and warnings in a structured format.

## Building the binary

From the repository root, `npm run repo:validator-binary` builds for the current
machine. It uses `compile.sh` (default: `--local`), clears `bin` and `dist/bin`
under `modules/operation/apps/validator/ts-wrapper`, and writes the executable
to both directories. Go is required.

To build all four release binaries (Linux and macOS, amd64 and arm64), run:

```sh
bash packages-golang/validator/compile.sh --all
```

Starting the worker with `npm run dev:operation:gtfs-validator` automatically runs
`compile.sh` through the worker's `predev` hook before starting the Node process.

The `build-binary.yml` release workflow runs `compile.sh --all` and uploads the
four binaries to a GitHub release. Container packaging is a separate step;
running this script locally does not rebuild or deploy the worker image.

## Architecture Overview

The GTFS Validator follows a modular, concurrent architecture designed for efficiency and extensibility. The system is organized into several key components:

### Core Components

1. **GTFS Loader** - Opens existing GTFS SQLite databases
2. **SQLite Storage** - Stores GTFS data in a temporary SQLite database for efficient access
3. **Validation Registry** - Manages registration and discovery of validation functions
4. **Rules Engine** - Processes configurable validation rules from JSON files
5. **Message Service** - Collects and aggregates validation results
6. **Validation Context** - Provides common utilities for validation functions

### High-Level Flow

```
Existing GTFS SQLite Database → ID Map Preparation → File Validation → Table Validations (Concurrent) → Results Output
```

### Architecture Diagram

```mermaid
classDiagram
    class Main {
        +main()
        +runValidations()
    }
    
    class GTFSSQLite {
        +ReadGTFSSQLite()
    }
    
    class Gtfs {
        +HasTable()
        +IterateStops()
        +IterateTrips()
    }
    
    class RulesParser {
        +ParseRules()
    }
    
    class GtfsRules {
        +validation rules
    }
    
    class Registry {
        +Register()
        +Get()
    }
    
    class TableValidation {
        +RunValidations()
    }
    
    Main --> GTFSSQLite : opens SQLite
    GTFSSQLite --> Gtfs : supplies database
    Main --> RulesParser : loads rules
    RulesParser --> GtfsRules : parses
    Main --> Registry : queries
    Registry --> TableValidation : executes
    TableValidation --> Gtfs : reads data
    TableValidation --> GtfsRules : uses rules
    
    class MessageService {
        +AddMessage()
        +PrintJSON()
    }
    
    TableValidation --> MessageService : reports issues
    Main --> MessageService : outputs results
```

## GTFS Loading Process

The validator accepts an existing SQLite database produced by [import-gtfs](../import-gtfs/).
Run the importer separately, then pass its output path with `-input /path/to/gtfs.db`.
The flow is `import-gtfs → SQLite → validator → validation results`.
The validator uses shared `telemetry` timing. Its integration test uses `import-gtfs`
to verify that the producer output can be loaded and prepared for validation.
ZIP input is no longer supported by the validator.

`ReadGTFSSQLite()` opens the database without creating missing files, rebuilds the
validator's `id_map`, and loads ID lookups into memory. Validation then prepares
its indexes and derived tables. The input must be writable and is retained after
validation; only the connection is closed. Repeated validation rebuilds the ID map.

The validator uses the pure-Go SQLite driver, so `CGO_ENABLED=0` remains supported.

## Validation Processing

The validation system uses a registry pattern that allows validation functions to be registered and discovered automatically.

### Validation Registry

The `validations.Registry` maintains a thread-safe map of table names to validation functions:

- **Registration**: Each validation package registers itself during `init()` using `validations.Register(tableName, validationFunction)`
- **Discovery**: The main validation loop looks up validation functions by table name
- **Thread Safety**: The registry uses read-write mutexes to support concurrent access

### Validation Execution Flow

1. **Rules Parsing**: Validation rules are loaded from a JSON file (if provided) and parsed into a `GtfsRules` structure
2. **File Validation**: Basic file-level validations run first (required files, forbidden files, conditional requirements)
3. **Table Validation**: For each GTFS table:
   - Check if the table exists in the database
   - Look up the registered validation function
   - Execute the validation function in a separate goroutine
4. **Concurrent Execution**: All table validations run concurrently using goroutines and a `sync.WaitGroup`
5. **Completion**: The system waits for all validations to complete before proceeding

### Validation Function Signature

Each validation function follows this signature:

```go
func(gtfs types.Gtfs, rules *types.GtfsRules)
```

- **gtfs**: Provides access to the GTFS data via iterator methods and database queries
- **rules**: Contains the validation rules for the specific table being validated

### Validation Context

The `ValidationContext` struct provides common utilities for validation functions:

- **Severity Management**: Checks if a validation should be ignored or if a field is forbidden
- **Message Creation**: Standardized message creation with proper formatting
- **Translation Support**: Access to internationalized error messages
- **Row Tracking**: Tracks which rows have validation issues

## Results Collection and Output

### Message Service

The `MessageService` collects all validation messages throughout the execution:

- **Message Aggregation**: Messages are collected with metadata (file name, field, row numbers, severity)
- **Deduplication**: Duplicate messages are merged, keeping track of all affected rows
- **Severity Tracking**: Maintains counts of errors and warnings
- **Early Exit**: Can exit early if too many issues are detected (configurable limit)

### Output Formats

The validator supports multiple output formats:

1. **JSON Output**: Structured JSON output with all messages and summary statistics
2. **File Output**: Results can be written to a file using the `-out` flag
3. **Console Output**: Results are printed to console by default

### Message Structure

Each validation message contains:

- **ValidationID**: Unique identifier for the validation rule
- **Message**: Human-readable error or warning message
- **Severity**: ERROR, WARNING, or IGNORE
- **FileName**: The GTFS file being validated
- **Field**: The specific field being validated
- **Rows**: Array of row numbers (1-indexed, accounting for header row) where the issue occurs

## Configuration

### Command-Line Options

- `-input`: Path to the GTFS SQLite database (required)
- `-rules`: Path to the validation rules JSON file (optional)
- `-out` / `-o`: Path to write output file (optional)
- `-log`: Log level (debug, info, error)
- `-lang`: Language for error messages (en, es, pt)

### Rules File Format

The rules file accepts a flat object keyed by rule ID, either directly or inside a `validation_rules` object. Partial configurations are supported; omitted rules and severities default to `ignore`. For example:

```json
{
  "validation_rules": {
    "agency_file_missing": {
      "severity": "error",
      "depends_on": []
    },
    "agency_id_unique": {
      "severity": "warning",
      "depends_on": ["agency_file_missing"]
    }
  }
}
```

`<group>_file_missing` configures the file-presence severity previously stored as `<group>._file` and is a valid prerequisite for rules in that group. It passes when the table exists and fails when it is missing, even when its severity is `ignore` or its configuration entry is omitted. File-presence rules have no prerequisites.

Each rule can have:

- **severity**: `error`, `warning`, `info`, `ignore`, or `forbidden`
- **options**: An array of allowed string values
- **compare**: An array of `{ "key": "field_name", "value": "expected_value" }` objects
- **depends_on**: Rule IDs from the same file, including `<file>_file_missing`, that must pass before this rule runs

Dependencies come only from `depends_on` in the supplied rules JSON. Omitting it or supplying an empty array means the rule has no prerequisites. Unknown dependencies, cycles, and dependencies on incompatible execution phases are rejected before the GTFS is imported. Execution scopes are declared in `lib/rules/scopes.go`; they do not add dependencies.

Run `npm run repo:validator-rules` to generate only `packages-new/types/gtfs-validator/src/rules-new/rule-ids.ts`. The generator reads IDs from the validation implementations; it does not generate a catalogue or define dependencies.

Rules grouped by GTFS file are rejected. The runtime stores `types.GtfsRules` as a map from rule ID to `types.RuleContext`: `agency_id_unique` is read directly, without an `agency` section or an `agency.` prefix. Each check receives only its own context, for example `AgencyEmailField(db, rules.Rule("agency_email_field"))`. Use `ignore` to disable a rule. The generated list's technical diagnostic IDs, including `file_validation` and `file_not_found_in_rules`, are accepted as flat entries, but their runtime severities remain fixed.

## Performance Considerations

- **Concurrent Validations**: Table validations run concurrently to maximize CPU utilization
- **Streaming Access**: Data is streamed from SQLite rather than loaded entirely into memory
- **Batch Processing**: Database operations use batch transactions
- **Early Termination**: Can exit early if too many validation errors are detected
- **Progress Tracking**: Large tables show progress indicators during validation

## Cleanup

After validation completes:

1. The SQLite database connection is closed
2. The temporary database file is removed
3. Results are output in the requested format

This ensures no temporary files are left behind after validation completes.
