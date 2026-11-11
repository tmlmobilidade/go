package queries

import (
	"fmt"
	"slices"
	"strings"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator/src/services/database"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
* ExistsMatching checks whether one source row matches every supplied field value.
* Fields are combined with AND; their names are sorted before building SQL so
* map iteration does not change the condition or parameter order.
* Values are bound parameters. SQL NULL and missing columns match empty strings
* through COALESCE. A table, database connection and at least one field are required.
 */
func ExistsMatching(table *types.SQLiteTable, fields map[string]string) (bool, error) {
	//

	//
	// 1. Require a table, its database pool and at least one matching condition

	if table == nil || table.DB == nil || len(fields) == 0 {
		return false, fmt.Errorf("matching rows requires a table, database, and fields")
	}

	//
	// 2. Sort the field names to keep expressions and bound values aligned

	keys := make([]string, 0, len(fields))
	for key := range fields {
		keys = append(keys, key)
	}
	slices.Sort(keys)

	//
	// 3. Resolve each column and normalize NULL values before comparing

	conditions := make([]string, 0, len(keys))
	values := make([]any, 0, len(keys))
	for _, key := range keys {
		expression, err := column(table, "source", key)
		if err != nil {
			return false, err
		}
		conditions = append(conditions, "COALESCE("+expression+", '') = ?")
		values = append(values, fields[key])
	}

	//
	// 4. Check all conditions in one query without loading matching rows

	query := "SELECT EXISTS(SELECT 1 FROM " + dbops.SanitizeName(table.Name) +
		" AS source WHERE " + strings.Join(conditions, " AND ") + ")"
	var exists bool
	if err := table.DB.QueryRow(query, values...).Scan(&exists); err != nil {
		return false, err
	}

	//
	// 5. Return whether a row satisfied every condition

	return exists, nil
}
