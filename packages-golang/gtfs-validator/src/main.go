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
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/services"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
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

// Public report types are also available from the validator entry point.
type Summary = types.Summary
type RuleMessage = types.RuleMessage
type Message = types.Message

// GtfsValidator owns the temporary SQLite directory and removes it on every return path.
// A non-nil error means the run failed operationally, not that the feed is invalid.
// Import currently has no context support: cancellation takes effect before/after
// import and during rule execution. A partial report is returned on execution failure.
func GtfsValidator(ctx context.Context, options Options) (summary Summary, err error) {
	collector := services.NewReport()
	summary = collector.Summary()

	// Both comparisons have the same value when both sources are empty or both
	// are supplied. Either case is invalid: exactly one source must be selected.
	if (options.Source.Path == "") == (options.Source.Url == "") {
		return summary, errors.New("provide exactly one local path or URL")
	}

	if options.Concurrency < 0 {
		return summary, errors.New("concurrency must be >= 1")
	}
	if options.Concurrency == 0 {
		options.Concurrency = 1
	}

	// A context carries cancellation/deadline signals through the call chain.
	if err := ctx.Err(); err != nil {
		return summary, err
	}
	// Own one temporary directory for the database and its SQLite sidecar files.
	directory, err := os.MkdirTemp("", "gtfs-validator-*")
	if err != nil {
		return summary, err
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
		return summary, fmt.Errorf("import GTFS: %w", err)
	}

	if err := ctx.Err(); err != nil {
		return summary, err
	}

	// Reopen the imported file for the rules. *sql.DB represents a connection pool,
	// which the SQLite package restricts to one connection.
	database, err := sqlite.NewSQLiteDatabase(sqlite.SQLiteDatabaseConfig{InstancePath: databasePath})
	if err != nil {
		return summary, err
	}

	// Registered after directory cleanup, so this runs first and releases the file.
	defer func() { err = errors.Join(err, database.DatabaseInstance.Close()) }()
	results, err := rules.RunValidations(ctx, database.DatabaseInstance, options.Concurrency)
	for _, result := range results {
		for _, finding := range result.Value {
			collector.Add(Message{
				Rows: finding.Rows, Field: finding.Field, FileName: finding.FileName,
				Message: finding.Message, RuleID: result.ID, Severity: finding.Severity,
			}, finding.Description)
		}
	}
	summary = collector.Summary()
	return summary, err
}
