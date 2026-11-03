package utils

import (
	dbops "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/database"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
)

// column returns SQL NULL for an absent CSV header, so required-field rules can
// validate it without treating it as a failed database query.
func Column(t *types.SQLiteTable, alias, field string) string {
	if !t.Columns[field] {
		return "NULL"
	}
	return alias + "." + dbops.SanitizeName(field)
}
