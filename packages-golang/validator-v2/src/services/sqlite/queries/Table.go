package queries

import (
	"fmt"
	"strings"

	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/types"
)

// Table selects any imported table. It does not fetch or cache field values.
func Table(t *types.SQLiteTable, name string) (*types.SQLiteTable, error) {
	//

	//
	// 1. Check if the table is nil

	if t == nil {
		return nil, fmt.Errorf("SQLite table is nil")
	}

	//
	// 2. Check if the table is prepared

	if t.Prepared != nil {
		table, ok := t.Prepared.Tables[strings.ToLower(name)]
		if !ok {
			return nil, fmt.Errorf("SQLite table %q is not available", name)
		}
		return table, nil
	}

	//
	// 3. Check if the table name is the same

	if strings.EqualFold(name, t.Name) {
		return t, nil
	}

	//
	// 4. Return the table

	return LoadSQLiteTable(t.DB, name)
}
