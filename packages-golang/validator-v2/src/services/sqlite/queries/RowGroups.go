package queries

import (
	dbops "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/database"
	utils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/utils"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
)

// rowGroups reads keys and source row IDs together, avoiding a query per row.
// Groups and their members retain source order. Empty keys remain independent
// rows and never participate in a grouped check.
func RowGroups(t *types.SQLiteTable, field string) ([]types.SQLiteRowGroup, error) {
	//

	//
	// 1. Query the table

	query := "SELECT source.rowid, COALESCE(" + utils.Column(t, "source", field) + ", '') FROM " +
		dbops.SanitizeName(t.Name) + " AS source ORDER BY source.rowid"
	rows, err := t.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	//
	// 2. Initialize the groups

	var groups []types.SQLiteRowGroup
	indexes := map[string]int{}

	//
	// 3. Read the rows

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
	// 4. Return the groups

	return groups, rows.Err()
}
