// Package gtfsvalidator imports a GTFS archive and runs the built-in validation rules.
package gtfsvalidator

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
	importgtfs "github.com/tmlmobilidade/go/packages-golang/import-gtfs/src"
	sqlite "github.com/tmlmobilidade/go/packages-golang/sqlite/src"
)

// Options contains the input archive and execution settings for one run.
type Options struct {
	Source importgtfs.ImportGtfsConfigSource

	// Zero uses the default of one. Negative limits are invalid.
	Concurrency int

	// Config reserves an opaque JSON object for future validation settings.
	// No properties influence validation yet.
	Config map[string]json.RawMessage
}

// Re-export the rule finding types so library callers can continue to use
// gtfsvalidator.Finding and gtfsvalidator.Severity. Go type aliases (=) refer to
// the same types, allowing the rules subpackage to avoid an import cycle.
type Finding = rules.Finding
type Severity = rules.Severity

const (
	Error   = rules.Error
	Warning = rules.Warning
)

// Keep the public result names available from the main validator package.
type RuleResult = rules.RuleResult
type Report = rules.Report

// GtfsValidator owns the temporary SQLite directory and removes it on every return path.
// A non-nil error means the run failed operationally, not that the feed is invalid.
// Import currently has no context support: cancellation takes effect before/after
// import and during rule execution. A partial report is returned on execution failure.
func GtfsValidator(ctx context.Context, options Options) (report Report, err error) {
	report = rules.PendingReport()

	// Named return values (report, err) let deferred cleanup update the result.
	// defer runs when this function exits; deferred calls run in reverse order.
	// This callback runs last, after database closure and directory removal.
	defer func() {
		if err != nil {
			report.Error = err.Error()
		}
	}()

	// Both comparisons have the same value when both sources are empty or both
	// are supplied. Either case is invalid: exactly one source must be selected.
	if (options.Source.Path == "") == (options.Source.Url == "") {
		return report, errors.New("provide exactly one local path or URL")
	}

	if options.Concurrency < 0 {
		return report, errors.New("concurrency must be >= 1")
	}
	if options.Concurrency == 0 {
		options.Concurrency = 1
	}

	// A context carries cancellation/deadline signals through the call chain.
	if err := ctx.Err(); err != nil {
		return report, err
	}
	// Own one temporary directory for the database and its SQLite sidecar files.
	directory, err := os.MkdirTemp("", "gtfs-validator-*")
	if err != nil {
		return report, err
	}

	// Keep the original failure if cleanup also fails; errors.Join preserves both.
	defer func() { err = errors.Join(err, os.RemoveAll(directory)) }()

	config := importgtfs.ImportGtfsConfig{
		Source:        options.Source,
		Sqlite_config: sqlite.SQLiteDatabaseConfig{InstancePath: filepath.Join(directory, "gtfs.db")},
	}
	// The importer writes and closes the database. No date filter is supplied,
	// because validation must see the original feed.
	databasePath, err := importgtfs.ImportGtfsToDatabase(config)
	if err != nil {
		return report, fmt.Errorf("import GTFS: %w", err)
	}

	if err := ctx.Err(); err != nil {
		return report, err
	}

	// Reopen the imported file for the rules. *sql.DB represents a connection pool,
	// which the SQLite package restricts to one connection.
	database, err := sqlite.NewSQLiteDatabase(sqlite.SQLiteDatabaseConfig{InstancePath: databasePath})
	if err != nil {
		return report, err
	}

	// Registered after directory cleanup, so this runs first and releases the file.
	defer func() { err = errors.Join(err, database.DatabaseInstance.Close()) }()
	report, err = rules.RunValidations(ctx, database.DatabaseInstance, options.Concurrency)
	return report, err
}
