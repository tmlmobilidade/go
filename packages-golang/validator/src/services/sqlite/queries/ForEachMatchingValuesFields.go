package queries

import (
	"fmt"

	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
* ForEachMatchingValuesFields deduplicates string keys and queries at most 500
* distinct keys at a time through ForEachMatchingFields. Empty key lists perform
* no queries, but at least one requested field is always required.
* Batches follow the keys' first occurrence; rows follow rowid order within each
* batch, not key order or global rowid order across batches.
* Field normalization, open-cursor callbacks and errors follow ForEachMatchingFields.
* The first failed batch or callback stops processing the remaining keys.
 */
func ForEachMatchingValuesFields(t *types.SQLiteTable, field string, keys []string, fields []string, fn func(*types.SQLiteRow, map[string]string) error) error {
	//

	//
	// 1. Require fields before scheduling any lookup batches

	if len(fields) == 0 {
		return fmt.Errorf("at least one field is required")
	}

	//
	// 2. Deduplicate keys across all batches and execute each full batch of 500

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
	// 3. Execute the final partial batch, if any distinct keys remain

	if len(batch) > 0 {
		return ForEachMatchingFields(t, field, batch, fields, fn)
	}

	//
	// 4. Finish successfully when all batches completed or there were no keys

	return nil
}
