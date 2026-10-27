//go:build ignore

// This file provides the command-line program. The build instruction above
// excludes it from normal library builds; run or build this file explicitly.
package main

/* * */

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"os"
	"strings"

	sqlite3 "github.com/mattn/go-sqlite3"
	importgtfs "github.com/tmlmobilidade/go/packages-golang/import-gtfs/src"
	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/render"
)

/* * */

func main() {
	// Send logs to standard error (stderr). Standard output (stdout) is reserved
	// for the result, so scripts can save it without also saving log messages.
	telemetry.Logger = telemetry.CreateLogger(func(record telemetry.LogRecord) {
		if os.Getenv("ENVIRONMENT") == "dev" {
			render.RenderDevTo(record, os.Stderr, os.Stderr)
		} else {
			render.RenderStructuredTo(record, os.Stderr, os.Stderr)
		}
	})

	// Define command-line options and where their values will be stored.
	// Flags are named options such as -path or -memory.
	var config importgtfs.ImportGtfsConfig
	var help bool
	var configJSON string
	flag.StringVar(&configJSON, "config", "", "Import configuration as a JSON object")

	flag.BoolVar(&help, "help", false, "Show help and exit (also --help)")
	flag.BoolVar(&help, "h", false, "Show help and exit (short form)")
	flag.StringVar(&config.Source.Path, "path", "", "Local GTFS ZIP path (use either -path or -url)")
	flag.StringVar(&config.Source.Url, "url", "", "GTFS ZIP URL (use either -path or -url)")
	flag.StringVar(&config.Sqlite_config.InstanceName, "instance-name", "", "Custom database instance name")
	flag.StringVar(&config.Sqlite_config.InstancePath, "instance-path", "", "Output database path (defaults to a temporary file)")
	flag.BoolVar(&config.Sqlite_config.Memory, "memory", false, "Return a binary SQLite database on stdout without writing a database file (ignores -instance-path)")

	// Show usage, configuration examples, and exit-code meanings when help is requested.
	flag.Usage = func() {
		telemetry.Logger.Info("Import a GTFS ZIP into SQLite with dynamic TEXT columns and no GTFS validation.")
		telemetry.Logger.Info("Usage: " + os.Args[0] + " (-config JSON | -path GTFS.zip | -url URL) [options]\n\nOptions:")
		flag.PrintDefaults()
		telemetry.Logger.Info(`
Examples (from the package directory):
  go run ./src/cli.go -path ./gtfs.zip
  go run ./src/cli.go -path ./gtfs.zip -instance-path ./gtfs.db
  go run ./src/cli.go -url https://example.com/gtfs.zip
  go run ./src/cli.go -path ./gtfs.zip -memory > ./gtfs.db
  go run ./src/cli.go -config '{"source":{"path":"./gtfs.zip"},"sqlite_config":{"instancePath":"./gtfs.db"}}'

JSON configuration:
  Uses source.path or source.url and optional sqlite_config with instanceName,
  instancePath, and memory. Optional time_range selects active service dates using
  date_range (inclusive start/end YYYYMMDD integers) and/or discrete_dates.
  Both filters must match when supplied together. Empty discrete_dates is ignored.
  Weekly calendars are expanded and exceptions applied. Trips and their stop times,
  routes, shapes, and stops are filtered to selected services.
  Explicit CLI flags override JSON values.
  A source flag replaces the JSON source. Database instances cannot be passed as JSON.

Output:
  Prints the absolute database path to stdout, or binary SQLite bytes with -memory.
  Diagnostics go to stderr.
  Temporary output files are the caller's responsibility to remove.

Exit codes:
  0  Success or help
  1  Import failed
  2  Invalid arguments`)
	}

	// Read the supplied options. Help exits before source validation or import.
	flag.Parse()
	if help {
		flag.Usage()
		return
	}

	// Visit lists only options the user actually supplied, including -memory=false.
	var hasConfig, hasSource bool
	flag.Visit(func(option *flag.Flag) {
		hasConfig = hasConfig || option.Name == "config"
		hasSource = hasSource || option.Name == "path" || option.Name == "url"
	})
	if hasConfig {
		// Read JSON as the base settings. Reject unknown properties and extra JSON
		// values so configuration mistakes produce a clear error.
		overrides := config
		config = importgtfs.ImportGtfsConfig{}
		decoder := json.NewDecoder(strings.NewReader(configJSON))
		decoder.DisallowUnknownFields()
		err := decoder.Decode(&config)
		if err == nil {
			if decoder.Decode(new(any)) != io.EOF {
				err = fmt.Errorf("expected a single JSON object")
			}
		}
		if err != nil {
			telemetry.Logger.Error(telemetry.LogEntry{Message: "Invalid JSON config", Error: err})
			os.Exit(2)
		}

		// Explicit command-line options take priority over JSON settings.
		if hasSource {
			config.Source = overrides.Source
		}
		flag.Visit(func(option *flag.Flag) {
			switch option.Name {
			case "instance-name":
				config.Sqlite_config.InstanceName = overrides.Sqlite_config.InstanceName
			case "instance-path":
				config.Sqlite_config.InstancePath = overrides.Sqlite_config.InstancePath
			case "memory":
				config.Sqlite_config.Memory = overrides.Sqlite_config.Memory
			}
		})
	}

	// Require exactly one source and reject arguments without an option name.
	if flag.NArg() != 0 || (config.Source.Path == "") == (config.Source.Url == "") {
		telemetry.Logger.Error("Provide exactly one of -path or -url, with no positional arguments.")
		flag.Usage()
		os.Exit(2)
	}

	// An in-memory connection cannot be handed to another program. Instead,
	// write the complete SQLite database as bytes for the caller to save or read.
	if config.Sqlite_config.Memory {
		if err := writeMemoryDatabase(config); err != nil {
			telemetry.Logger.Error(err)
			os.Exit(1)
		}
		return
	}

	// For file output, import the data and print its absolute database path.
	instancePath, err := importgtfs.ImportGtfsToDatabase(config)
	if err != nil {
		telemetry.Logger.Error(err)
		os.Exit(1)
	}
	if _, err := io.WriteString(os.Stdout, instancePath+"\n"); err != nil {
		telemetry.Logger.Error(err)
		os.Exit(1)
	}
}

// Imports into memory and writes the database bytes to stdout.
func writeMemoryDatabase(config importgtfs.ImportGtfsConfig) error {
	database, err := importgtfs.ImportGtfsToMemory(config)
	if err != nil {
		return err
	}
	// defer runs this cleanup when the function returns, including after an error.
	defer database.DatabaseInstance.Close()

	// Reserve a connection to access the SQLite driver's database export feature.
	connection, err := database.DatabaseInstance.Conn(context.Background())
	if err != nil {
		return err
	}
	defer connection.Close()

	// Serialize turns the main SQLite database into the same bytes used by a .db file.
	return connection.Raw(func(driverConnection any) error {
		contents, err := driverConnection.(*sqlite3.SQLiteConn).Serialize("main")
		if err != nil {
			return err
		}
		_, err = os.Stdout.Write(contents)
		return err
	})
}
