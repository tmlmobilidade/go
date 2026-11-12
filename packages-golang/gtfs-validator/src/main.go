// Package gtfsvalidator imports a GTFS archive and runs configured validation rules.
package gtfsvalidator

import (
	"context"
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

	Rules []types.Rule
}

// GtfsValidator imports a GTFS archive into a temporary SQLite database and runs
// the configured rules. A successful execution returns its findings. The
// validator checks for cancellation before and after import and passes ctx to
// the rule executor.
func GtfsValidator(ctx context.Context, options Options) (summary types.Summary, err error) {
	//

	//
	// 1. Initialize the report collector
	collector := services.NewReport()
	summary = collector.Summary()

	//
	// 2. Validate the input options
	if err := validateOptions(options); err != nil {
		return summary, err
	}
	if err := ctx.Err(); err != nil {
		return summary, err
	}
	graph, err := rules.NewValidationGraph(options.Rules)
	if err != nil {
		return summary, err
	}

	//
	// 3. Import the GTFS data into a SQLite database
	// Own one temporary directory for the database and its SQLite sidecar files.
	directory, err := os.MkdirTemp("", "gtfs-validator-*")
	if err != nil {
		return summary, err
	}
	defer func() { err = errors.Join(err, os.RemoveAll(directory)) }()

	database, err := importFeed(options.Source, filepath.Join(directory, "gtfs.db"))
	if err != nil {
		return summary, err
	}
	defer func() { err = errors.Join(err, database.DatabaseInstance.Close()) }()
	if err := ctx.Err(); err != nil {
		return summary, err
	}

	if err := createValidationIndexes(ctx, database.DatabaseInstance); err != nil {
		return summary, err
	}

	//
	// 4. Run the validation rules
	results, err := graph.Execute(ctx, database.DatabaseInstance, max(options.Concurrency, 1))
	if err != nil {
		return summary, err
	}
	for _, result := range results {
		for _, finding := range result.Value {
			collector.Add(types.Message{
				Rows:     finding.Rows,
				Field:    finding.Field,
				FileName: finding.FileName,
				Message:  finding.Message,
				RuleID:   result.ID,
				Severity: finding.Severity,
			}, finding.Description)
		}
	}

	//
	// 5. Return the summary
	return collector.Summary(), nil
}

// validateOptions requires exactly one archive source and a non-negative
// concurrency limit. A limit of zero selects the default.
func validateOptions(options Options) error {
	if (options.Source.Path == "") == (options.Source.Url == "") {
		return errors.New("provide exactly one local path or URL")
	}
	if options.Concurrency < 0 {
		return errors.New("concurrency must be >= 1")
	}
	return nil
}

// importFeed imports the archive and opens the resulting SQLite database.
// The caller owns the returned connection.
func importFeed(source importgtfs.ImportGtfsConfigSource, destination string) (*sqlite.SQLiteDatabase, error) {
	config := importgtfs.ImportGtfsConfig{
		Source:        source,
		Sqlite_config: sqlite.SQLiteDatabaseConfig{InstancePath: destination},
	}
	databasePath, err := importgtfs.ImportGtfsToDatabase(config)
	if err != nil {
		return nil, fmt.Errorf("import GTFS: %w", err)
	}
	return sqlite.NewSQLiteDatabase(sqlite.SQLiteDatabaseConfig{InstancePath: databasePath})
}
