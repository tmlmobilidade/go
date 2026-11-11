package utils

import types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"

/*
* At creates a source-row reference without querying SQLite or checking existence.
* The row index is zero-based: query helpers convert it to SQLite rowid with +1.
* Field values are read later unless a batch reader populates the Values map.
 */
func At(t *types.SQLiteTable, row int) *types.SQLiteRow {
	//

	//
	// 1. Keep the table and source position for subsequent field queries

	return &types.SQLiteRow{Table: t, Row: row}
}
