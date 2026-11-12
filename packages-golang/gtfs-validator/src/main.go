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
	database, err := importFeed(options.Source)

	//
	// 4. Run the validation rules
	results, err := graph.Execute(ctx, database.DatabaseInstance, max(options.Concurrency, 1))
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

// importFeed imports the entire archive into SQLite and returns the resulting
// database path. The importer closes the database before returning.
func importFeed(source importgtfs.ImportGtfsConfigSource) (*sqlite.SQLiteDatabase, error) {
	//

	//
	// Create a temporary directory for the database and its SQLite sidecar files.
	directory, err := os.MkdirTemp("", "gtfs-validator-*")
	if err != nil {
		return nil, err
	}
	defer func() { err = errors.Join(err, os.RemoveAll(directory)) }()

	//
	// Import the GTFS data into the database
	config := importgtfs.ImportGtfsConfig{
		Source:        source,
		Sqlite_config: sqlite.SQLiteDatabaseConfig{InstancePath: filepath.Join(directory, "gtfs.db")},
	}
	
	databasePath, err := importgtfs.ImportGtfsToDatabase(config)
	if err != nil {
		return nil, fmt.Errorf("import GTFS: %w", err)
	}
	
	//
	// Open the database and return it
	database, err := sqlite.NewSQLiteDatabase(sqlite.SQLiteDatabaseConfig{InstancePath: databasePath})
	if err != nil {
		return nil, err
	}
	defer func() { err = errors.Join(err, database.DatabaseInstance.Close()) }()
	
	return database, nil
}