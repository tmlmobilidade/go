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
	"path/filepath"
	"syscall"

	gtfsvalidator "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/render"
)

// Keep os.Exit outside run: os.Exit ends the process without running defers.
// Returning from run first ensures its cancellation cleanup has already happened.
func main() {
	os.Exit(run())
}

func run() int {
	// Keep importer logs on stderr with the other CLI diagnostics.
	telemetry.Logger = telemetry.CreateLogger(func(record telemetry.LogRecord) {
		render.RenderDevTo(record, os.Stderr, os.Stderr)
	})

	// StringVar/IntVar bind flags to fields. & passes the address of a field so
	// parsing can write the supplied value into it.
	var options gtfsvalidator.Options
	var rulesPath string
	var resultPath string
	var tracePath string
	var help bool

	flags := flag.NewFlagSet("gtfs-validator", flag.ContinueOnError)
	flags.SetOutput(os.Stderr)
	flags.StringVar(&options.Source.Path, "path", "", "Local GTFS ZIP path (exactly one of -path or -url)")
	flags.StringVar(&options.Source.Url, "url", "", "GTFS ZIP URL")
	flags.StringVar(&rulesPath, "rules", "", "Path to a JSON array of validation rules (required)")
	flags.StringVar(&resultPath, "result", "", "Write the validation report to this JSON file (required)")
	flags.IntVar(&options.Concurrency, "concurrency", 1, "Maximum concurrent rules (>= 1)")
	flags.StringVar(&tracePath, "trace", "", "Write a JSON execution trace for visualization.html")
	flags.BoolVar(&help, "help", false, "Show help")
	flags.BoolVar(&help, "h", false, "Show help")

	flags.Usage = func() {
		fmt.Fprintln(os.Stderr, "Usage: gtfs-validator (-path GTFS.zip | -url URL) -rules RULES.json -result RESULT.json [-concurrency N] [-trace TRACE.json]")
		flags.PrintDefaults()
		fmt.Fprintln(os.Stderr, "Logs: stderr. Exit: 0 clean/warnings/help, 1 validation errors, 2 invalid arguments or operational failure.")
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
		telemetry.Logger.Error("Provide exactly one source, a rules file, positive concurrency, and no positional arguments.")
		return 2
	}
	if resultPath == "" {
		telemetry.Logger.Error("Provide a validation report path with -result.")
		return 2
	}
	if tracePath != "" && sameOutputPath(resultPath, tracePath) {
		telemetry.Logger.Error("Use different files for -result and -trace.")
		return 2
	}

	data, err := os.ReadFile(rulesPath)
	if err != nil {
		telemetry.Logger.Error(fmt.Errorf("read rules file: %w", err))
		return 2
	}
	if err := json.Unmarshal(data, &options.Rules); err != nil {
		telemetry.Logger.Error(fmt.Errorf("rules file must contain a JSON array: %w", err))
		return 2
	}

	// Convert Ctrl+C and termination signals into cooperative cancellation.
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	var report types.Summary
	var trace *types.ValidationTrace
	if tracePath == "" {
		report, err = gtfsvalidator.GtfsValidator(ctx, options)
	} else {
		report, trace, err = gtfsvalidator.GtfsValidatorWithTrace(ctx, options)
	}
	if errors.Is(err, rules.ErrInvalidConfiguration) {
		return 2
	}

	resultErr := writeJSON(resultPath, report, rulesPath, options.Source.Path)
	if resultErr != nil {
		telemetry.Logger.Error(fmt.Sprintf("write result %q: %v", resultPath, resultErr))
	} else {
		telemetry.Logger.Success(fmt.Sprintf("Saved validation result to %q", resultPath))
	}
	var traceErr error
	if trace != nil {
		traceErr = writeJSON(tracePath, trace, rulesPath, options.Source.Path, resultPath)
		if traceErr != nil {
			telemetry.Logger.Error(fmt.Sprintf("write trace %q: %v", tracePath, traceErr))
		} else {
			telemetry.Logger.Success(fmt.Sprintf("Saved validation trace to %q", tracePath))
		}
	}

	if err != nil || resultErr != nil || traceErr != nil {
		return 2
	}

	if report.TotalErrors > 0 {
		return 1
	}

	return 0
}

func sameOutputPath(first, second string) bool {
	// Compare the containing directories too, since neither output may exist yet.
	return filepath.Clean(first) == filepath.Clean(second) || sameFile(first, second) ||
		(filepath.Base(first) == filepath.Base(second) && sameFile(filepath.Dir(first), filepath.Dir(second)))
}

func sameFile(first, second string) bool {
	a, errA := os.Stat(first)
	b, errB := os.Stat(second)
	return errA == nil && errB == nil && os.SameFile(a, b)
}

func writeJSON(path string, value any, protectedPaths ...string) error {
	if target, err := os.Stat(path); err == nil {
		if !target.Mode().IsRegular() {
			return errors.New("output path must point to a regular file")
		}
		for _, protected := range protectedPaths {
			if info, err := os.Stat(protected); err == nil && os.SameFile(target, info) {
				return fmt.Errorf("output path points to %q", protected)
			}
		}
		for _, output := range []*os.File{os.Stdout, os.Stderr} {
			if info, err := output.Stat(); err == nil && os.SameFile(target, info) {
				return errors.New("output path points to a redirected output stream")
			}
		}
	} else if !errors.Is(err, os.ErrNotExist) {
		return err
	}

	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	// Publish only a complete JSON file. A failed write leaves existing output intact.
	file, err := os.CreateTemp(dir, ".gtfs-validation-*")
	if err != nil {
		return err
	}
	defer os.Remove(file.Name())
	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	if err := errors.Join(encoder.Encode(value), file.Close()); err != nil {
		return err
	}
	return os.Rename(file.Name(), path)
}
