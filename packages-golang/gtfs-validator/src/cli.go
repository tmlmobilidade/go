//go:build ignore

// Build explicitly with go build ./src/cli.go, matching import-gtfs.
package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	gtfsvalidator "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/render"
)

// Keep os.Exit outside run: os.Exit ends the process without running defers.
// Returning from run first ensures its cancellation cleanup has already happened.
func main() {
	os.Exit(run())
}

func run() int {
	// Reserve stdout for machine-readable JSON. Importer logs use this shared logger.
	telemetry.Logger = telemetry.CreateLogger(func(record telemetry.LogRecord) {
		render.RenderStructuredTo(record, os.Stderr, os.Stderr)
	})

	// StringVar/IntVar bind flags to fields. & passes the address of a field so
	// parsing can write the supplied value into it.
	var options gtfsvalidator.Options
	var rulesPath string
	var help bool

	flags := flag.NewFlagSet("gtfs-validator", flag.ContinueOnError)
	flags.SetOutput(os.Stderr)
	flags.StringVar(&options.Source.Path, "path", "", "Local GTFS ZIP path (exactly one of -path or -url)")
	flags.StringVar(&options.Source.Url, "url", "", "GTFS ZIP URL")
	flags.StringVar(&rulesPath, "rules", "", "Path to a JSON array of validation rules (required)")
	flags.IntVar(&options.Concurrency, "concurrency", 1, "Maximum concurrent rules (>= 1)")
	flags.BoolVar(&help, "help", false, "Show help")
	flags.BoolVar(&help, "h", false, "Show help")

	flags.Usage = func() {
		fmt.Fprintln(os.Stderr, "Usage: gtfs-validator (-path GTFS.zip | -url URL) -rules RULES.json [-concurrency N]")
		flags.PrintDefaults()
		fmt.Fprintln(os.Stderr, "JSON report: stdout. Logs: stderr. Exit: 0 clean/warnings/help, 1 validation errors, 2 invalid arguments or operational failure.")
	}

	// os.Args[0] is the executable name; [1:] selects only its arguments.
	if err := flags.Parse(os.Args[1:]); err != nil {
		return 2
	}

	if help {
		flags.Usage()
		return 0
	}

	// Reject positional arguments, ambiguous sources, and invalid worker limits.
	if flags.NArg() != 0 || (options.Source.Path == "") == (options.Source.Url == "") || options.Concurrency < 1 || rulesPath == "" {
		fmt.Fprintln(os.Stderr, "Provide exactly one source, a rules file, positive concurrency, and no positional arguments.")
		return 2
	}

	data, err := os.ReadFile(rulesPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "read rules file: %v\n", err)
		return 2
	}
	if err := json.Unmarshal(data, &options.Rules); err != nil {
		fmt.Fprintf(os.Stderr, "rules file must contain a JSON array: %v\n", err)
		return 2
	}

	// Convert Ctrl+C and termination signals into cooperative cancellation.
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	report, err := gtfsvalidator.GtfsValidator(ctx, options)
	if errors.Is(err, rules.ErrInvalidConfiguration) {
		fmt.Fprintln(os.Stderr, err)
		return 2
	}

	// Keep stdout machine-readable for completed runs and operational failures.
	if encodeErr := json.NewEncoder(os.Stdout).Encode(report); encodeErr != nil {
		fmt.Fprintln(os.Stderr, encodeErr)
		return 2
	}

	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return 2
	}

	if report.TotalErrors > 0 {
		return 1
	}

	return 0
}
