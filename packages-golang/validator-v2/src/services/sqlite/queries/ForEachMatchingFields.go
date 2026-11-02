package queries

import (
	"database/sql"
	"fmt"
	"strings"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/database"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/types"
	utils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/utils"
)

// ForEachMatchingFields streams the requested values with their source row in
// one query, avoiding a separate Fields query per match. Values are not cached.
// Missing columns and NULLs have the same empty-string semantics as Fields.
func ForEachMatchingFields(t *types.SQLiteTable, field string, keys []any, fields []string, fn func(*types.SQLiteRow, map[string]string) error) error {
	//

	//
	// 1. Check if the fields are empty

	if len(fields) == 0 {
		return fmt.Errorf("at least one field is required")
	}
	if len(keys) == 0 {
		return nil
	}

	//
	// 2. Build the query

	columns := []string{"source.rowid"}
	var rowID int
	values := make([]sql.NullString, len(fields))
	targets := make([]any, len(fields)+1)
	targets[0] = &rowID
	for i, name := range fields {
		columns = append(columns, utils.Column(t, "source", name))
		targets[i+1] = &values[i]
	}

	//
	// 3. Build the condition

	condition := " = ?"
	if len(keys) > 1 {
		condition = " IN (" + strings.TrimSuffix(strings.Repeat("?,", len(keys)), ",") + ")"
	}

	//
	// 4. Build the query

	query := "SELECT " + strings.Join(columns, ", ") + " FROM " + dbops.SanitizeName(t.Name) +
		" AS source WHERE COALESCE(" + utils.Column(t, "source", field) + ", '')" + condition + " ORDER BY source.rowid"

	//
	// 5. Execute the query

	rows, err := t.DB.Query(query, keys...)
	if err != nil {
		return err
	}
	defer rows.Close()

	//
	// 6. Iterate over the rows

	for rows.Next() {
		if err := rows.Scan(targets...); err != nil {
			return err
		}

		//
		// 7. Build the result

		result := make(map[string]string, len(fields))
		for i, name := range fields {
			result[name] = values[i].String
		}

		//
		// 8. Call the callback

		if err := fn(utils.At(t, rowID-1), result); err != nil {
			return err
		}
	}

	//
	// 9. Return the error

	return rows.Err()
}
