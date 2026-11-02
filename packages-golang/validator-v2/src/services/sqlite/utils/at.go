package utils

import types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/types"

// At selects a row by zero-based index.
func At(t *types.SQLiteTable, row int) *types.SQLiteRow {
	return &types.SQLiteRow{Table: t, Row: row}
}
