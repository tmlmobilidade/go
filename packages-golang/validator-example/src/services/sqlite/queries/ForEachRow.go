package queries

import (
	dbops "github.com/tmlmobilidade/go/packages-golang/validator-example/src/services/database"
	utils "github.com/tmlmobilidade/go/packages-golang/validator-example/src/services/sqlite/utils"
	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/sqlite"
)

// ForEachRow reads row IDs only. Callbacks may query fields through the row context.
// The database pool must allow another connection while this cursor is open.
func ForEachRow(t *types.SQLiteTable, fn func(*types.SQLiteRow) error) error {
	//

	//
	// 1. Query the table

	rows, err := t.DB.Query("SELECT rowid FROM " + dbops.SanitizeName(t.Name) + " ORDER BY rowid")
	if err != nil {
		return err
	}
	defer rows.Close()

	//
	// 2. Read the rows

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
	// 3. Return the error

	return rows.Err()
}
