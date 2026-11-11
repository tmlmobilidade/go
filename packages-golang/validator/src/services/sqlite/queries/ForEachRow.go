package queries

import (
	dbops "github.com/tmlmobilidade/go/packages-golang/validator/src/services/database"
	utils "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/utils"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
* ForEachRow visits every source row in ascending rowid order, selecting IDs only.
* Each callback receives a row reference with position rowid - 1; field values
* can be requested separately through the field query helpers.
* The cursor remains open during callbacks, so nested database queries require
* another connection in the pool. Callback and scan errors stop iteration;
* cursor errors are returned after the final row.
 */
func ForEachRow(t *types.SQLiteTable, fn func(*types.SQLiteRow) error) error {
	//

	//
	// 1. Open a cursor for source rowids in their original order

	rows, err := t.DB.Query("SELECT rowid FROM " + dbops.SanitizeName(t.Name) + " ORDER BY rowid")
	if err != nil {
		return err
	}
	defer rows.Close()

	//
	// 2. Convert rowids to row references and stop if a scan or callback fails

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
	// 3. Report any error encountered while advancing the cursor

	return rows.Err()
}
