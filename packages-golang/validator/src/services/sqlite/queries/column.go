package queries

import (
	"fmt"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator/src/services/database"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
* column resolves a field against the live schema before building a data query.
* Existing fields use a quoted identifier qualified by the supplied query alias.
* Absent fields become SQL NULL so validation can report missing CSV headers.
* Schema lookup failures are returned to the caller without building an expression.
 */
func column(table *types.SQLiteTable, alias, field string) (string, error) {
	//

	//
	// 1. Require a table and its database connection

	if table == nil || table.DB == nil {
		return "", fmt.Errorf("SQLite table and database connection are required")
	}

	//
	// 2. Check the current schema without retaining column metadata

	exists, err := columnExists(table.DB, table.Name, field)
	if err != nil {
		return "", err
	}

	//
	// 3. Use SQL NULL for absent fields and quote identifiers for existing fields

	if !exists {
		return "NULL", nil
	}
	return alias + "." + dbops.SanitizeName(field), nil
}
