package queries

import (
	dbops "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/database"
	utils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/utils"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
)

// ForEachMatching selects source rows whose field equals the supplied value.
// Values are bound parameters; callers can request just the fields they need.
func ForEachMatching(t *types.SQLiteTable, field, value string, fn func(*types.SQLiteRow) error) error {
	//

	//
	// 1. Build the query

	query := "SELECT rowid FROM " + dbops.SanitizeName(t.Name) + " AS source WHERE COALESCE(" + utils.Column(t, "source", field) + ", '') = ? ORDER BY rowid"

	//
	// 2. Execute the query

	rows, err := t.DB.Query(query, value)
	if err != nil {
		return err
	}
	defer rows.Close()

	//
	// 3. Iterate over the rows

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
	// 4. Return the error

	return rows.Err()
}
