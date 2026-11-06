package queries

import (
	"fmt"

	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/sqlite"
)

// ForEachMatchingValuesFields reads several lookup keys in bounded queries.
// Repeated keys are visited once. Rows are ordered by rowid within each batch;
// callers that need key order must collect the results and apply that order.
func ForEachMatchingValuesFields(t *types.SQLiteTable, field string, keys []string, fields []string, fn func(*types.SQLiteRow, map[string]string) error) error {
	//

	//
	// 1. Check if the fields are empty

	if len(fields) == 0 {
		return fmt.Errorf("at least one field is required")
	}

	//
	// 2. Build the batch

	const batchSize = 500 // Stay below SQLite's parameter limit, including older builds.
	seen := make(map[string]bool, len(keys))
	batch := make([]any, 0, min(len(keys), batchSize))
	for _, key := range keys {
		if seen[key] {
			continue
		}
		seen[key] = true
		batch = append(batch, key)
		if len(batch) == batchSize {
			if err := ForEachMatchingFields(t, field, batch, fields, fn); err != nil {
				return err
			}
			batch = batch[:0]
		}
	}

	//
	// 3. Process the remaining batch

	if len(batch) > 0 {
		return ForEachMatchingFields(t, field, batch, fields, fn)
	}

	//
	// 4. Return nil

	return nil
}
