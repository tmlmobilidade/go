//go:build ignore

// Run this entry point explicitly so it can live alongside the importgtfs library.
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
)

/* * */

func main() {
	// Map CLI arguments to the importer's configuration.
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

	flag.Usage = func() {
		output := flag.CommandLine.Output()
		fmt.Fprintln(output, "Import a GTFS ZIP into SQLite with dynamic TEXT columns and no GTFS validation.")
		fmt.Fprintf(output, "\nUsage: %s (-config JSON | -path GTFS.zip | -url URL) [options]\n\nOptions:\n", os.Args[0])
		flag.PrintDefaults()
		fmt.Fprintln(output, `
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

	flag.Parse()
	if help {
		flag.Usage()
		return
	}
	var hasConfig, hasSource bool
	flag.Visit(func(option *flag.Flag) {
		hasConfig = hasConfig || option.Name == "config"
		hasSource = hasSource || option.Name == "path" || option.Name == "url"
	})
	if hasConfig {
		// Decode the base configuration, then apply only explicitly supplied flags.
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
			fmt.Fprintln(os.Stderr, "Invalid JSON config:", err)
			os.Exit(2)
		}
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
	if flag.NArg() != 0 || (config.Source.Path == "") == (config.Source.Url == "") {
		fmt.Fprintln(os.Stderr, "Provide exactly one of -path or -url, with no positional arguments.")
		flag.Usage()
		os.Exit(2)
	}

	// Memory pointers cannot cross process boundaries. Transfer a SQLite image instead.
	if config.Sqlite_config.Memory {
		if err := writeMemoryDatabase(config); err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		return
	}

	// Keep stdout limited to the resulting path for use in scripts.
	instancePath, err := importgtfs.ImportGtfsToDatabase(config)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	fmt.Println(instancePath)
}

func writeMemoryDatabase(config importgtfs.ImportGtfsConfig) error {
	database, err := importgtfs.ImportGtfsToMemory(config)
	if err != nil {
		return err
	}
	defer database.DatabaseInstance.Close()
	connection, err := database.DatabaseInstance.Conn(context.Background())
	if err != nil {
		return err
	}
	defer connection.Close()
	return connection.Raw(func(driverConnection any) error {
		contents, err := driverConnection.(*sqlite3.SQLiteConn).Serialize("main")
		if err != nil {
			return err
		}
		_, err = os.Stdout.Write(contents)
		return err
	})
}
