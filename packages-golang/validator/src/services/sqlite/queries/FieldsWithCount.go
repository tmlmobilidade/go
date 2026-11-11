package queries

import (
	"database/sql"
	"fmt"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator/src/services/database"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
* FieldWithCount reads a source field and counts equal values across its table
* in one query. A non-NULL value includes the current row in its count.
* Equality uses SQLite's raw comparison: a NULL or missing field returns an empty
* string and a count of zero, because NULL does not equal NULL.
* This function always queries SQLite rather than using prefetched row values.
* A missing source row, schema failure or query failure is returned as an error.
 */
func FieldWithCount(r *types.SQLiteRow, field string) (string, int, error) {
	//

	//
	// 1. Require a row reference and its source table

	if r == nil || r.Table == nil {
		return "", 0, fmt.Errorf("select a row from a table before reading fields")
	}

	//
	// 2. Resolve the field for both the source row and the correlated count query

	table := dbops.SanitizeName(r.Table.Name)
	expression, err := column(r.Table, "source", field)
	if err != nil {
		return "", 0, err
	}
	other := "NULL"
	if expression != "NULL" {
		other = "other." + dbops.SanitizeName(field)
	}
	query := "SELECT " + expression + ", (SELECT COUNT(*) FROM " + table + " AS other WHERE " + other + " = " + expression + ") FROM " + table + " AS source WHERE source.rowid = ?"

	//
	// 3. Read the field and its raw-equality count using the source rowid

	var value sql.NullString
	var count int
	if err := r.Table.DB.QueryRow(query, r.Row+1).Scan(&value, &count); err != nil {
		return "", 0, fmt.Errorf("read %s.%s row %d: %w", r.Table.Name, field, r.Row, err)
	}

	//
	// 4. Return the value as text, mapping NULL to an empty string

	return value.String, count, nil
}
