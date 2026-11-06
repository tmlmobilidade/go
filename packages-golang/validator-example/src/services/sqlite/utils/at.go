package utils

import types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/sqlite"

// At selects a row by zero-based index.
func At(t *types.SQLiteTable, row int) *types.SQLiteRow {
	return &types.SQLiteRow{Table: t, Row: row}
}
