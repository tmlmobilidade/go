package queries

import (
	"database/sql"
	"fmt"
	"strings"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator/src/services/database"
	utils "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/utils"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
* ForEachMatchingFields streams rows matching one or more keys and reads the
* requested fields in the same query. Empty key lists skip the query, but at least
* one requested field is required even when no keys are supplied.
* Lookup NULLs and missing columns match empty keys. Returned NULL or missing
* field values become empty strings in a separate map for each callback.
* Rows follow rowid order. Values are not stored on the row reference, and the
* cursor stays open during callbacks; nested queries need another connection.
* Callback, schema, query and scan errors stop iteration and are returned.
 */
func ForEachMatchingFields(t *types.SQLiteTable, field string, keys []any, fields []string, fn func(*types.SQLiteRow, map[string]string) error) error {
	//

	//
	// 1. Require requested fields and skip lookups with no keys

	if len(fields) == 0 {
		return fmt.Errorf("at least one field is required")
	}
	if len(keys) == 0 {
		return nil
	}

	//
	// 2. Select the source rowid and prepare scan targets for the requested fields

	columns := []string{"source.rowid"}
	var rowID int
	values := make([]sql.NullString, len(fields))
	targets := make([]any, len(fields)+1)
	targets[0] = &rowID
	for i, name := range fields {
		expression, err := column(t, "source", name)
		if err != nil {
			return err
		}
		columns = append(columns, expression)
		targets[i+1] = &values[i]
	}

	//
	// 3. Use equality for one key or an IN condition with one parameter per key

	condition := " = ?"
	if len(keys) > 1 {
		condition = " IN (" + strings.TrimSuffix(strings.Repeat("?,", len(keys)), ",") + ")"
	}

	//
	// 4. Resolve the lookup field and order matches by their source rowid

	expression, err := column(t, "source", field)
	if err != nil {
		return err
	}
	query := "SELECT " + strings.Join(columns, ", ") + " FROM " + dbops.SanitizeName(t.Name) +
		" AS source WHERE COALESCE(" + expression + ", '')" + condition + " ORDER BY source.rowid"

	//
	// 5. Bind every key and keep the cursor open while processing matches

	rows, err := t.DB.Query(query, keys...)
	if err != nil {
		return err
	}
	defer rows.Close()

	//
	// 6. Scan one source row and its field values at a time

	for rows.Next() {
		if err := rows.Scan(targets...); err != nil {
			return err
		}

		//
		// 7. Build a separate result map, representing nullable cells as empty strings

		result := make(map[string]string, len(fields))
		for i, name := range fields {
			result[name] = values[i].String
		}

		//
		// 8. Visit the source row and stop immediately if its callback fails

		if err := fn(utils.At(t, rowID-1), result); err != nil {
			return err
		}
	}

	//
	// 9. Report any error encountered while advancing the cursor

	return rows.Err()
}
