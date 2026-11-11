package queries

import (
	dbops "github.com/tmlmobilidade/go/packages-golang/validator/src/services/database"
	utils "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/utils"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
* ForEachMatching visits source rows whose field matches the bound lookup value.
* SQL NULL and missing columns are treated as empty strings for matching.
* Rows are ordered by rowid and passed as references with zero-based positions;
* requested values can be read separately through the field query helpers.
* The cursor stays open during callbacks, so nested queries need another database
* connection. Callback errors stop iteration; scan and cursor errors propagate.
 */
func ForEachMatching(t *types.SQLiteTable, field, value string, fn func(*types.SQLiteRow) error) error {
	//

	//
	// 1. Build the lookup with NULL-as-empty matching and stable source-row order

	expression, err := column(t, "source", field)
	if err != nil {
		return err
	}
	query := "SELECT rowid FROM " + dbops.SanitizeName(t.Name) + " AS source WHERE COALESCE(" + expression + ", '') = ? ORDER BY rowid"

	//
	// 2. Bind the lookup value and keep the cursor open while visiting matches

	rows, err := t.DB.Query(query, value)
	if err != nil {
		return err
	}
	defer rows.Close()

	//
	// 3. Convert each SQLite rowid to a row reference and stop on callback errors

	for rows.Next() {
		var rowID int
		if err := rows.Scan(&rowID); err != nil {
			return err
		}
		if err := fn(utils.At(t, rowID-1)); err != nil {
			return err
		}
	}

	//
	// 4. Report any error encountered while advancing the cursor

	return rows.Err()
}
