package queries

import (
	dbops "github.com/tmlmobilidade/go/packages-golang/validator/src/services/database"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
* RowGroups reads grouping keys and source rowids together in one ordered query.
* Non-empty keys share one group, ordered by the key's first source occurrence;
* member positions follow rowid order and use the zero-based value rowid - 1.
* SQL NULL and missing columns become empty keys. Each empty key forms its own
* independent row group with Grouped=false rather than joining other empty rows.
* All groups and row positions are collected in memory before returning.
 */
func RowGroups(t *types.SQLiteTable, field string) ([]types.SQLiteRowGroup, error) {
	//

	//
	// 1. Read source rowids and NULL-as-empty keys in the original row order

	expression, err := column(t, "source", field)
	if err != nil {
		return nil, err
	}
	query := "SELECT source.rowid, COALESCE(" + expression + ", '') FROM " +
		dbops.SanitizeName(t.Name) + " AS source ORDER BY source.rowid"
	rows, err := t.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	//
	// 2. Map each non-empty key to its first group position

	var groups []types.SQLiteRowGroup
	indexes := map[string]int{}

	//
	// 3. Reuse groups for known keys and keep each empty-key row independent

	for rows.Next() {
		var rowID int
		var key string
		if err := rows.Scan(&rowID, &key); err != nil {
			return nil, err
		}
		index, exists := indexes[key]
		if key == "" || !exists {
			index = len(groups)
			groups = append(groups, types.SQLiteRowGroup{Grouped: key != ""})
			if key != "" {
				indexes[key] = index
			}
		}
		groups[index].Rows = append(groups[index].Rows, rowID-1)
	}

	//
	// 4. Return the collected groups together with any cursor error

	return groups, rows.Err()
}
