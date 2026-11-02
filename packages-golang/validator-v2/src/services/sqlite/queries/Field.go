package queries

import types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/types"

// Field reads a field from the current row.
func Field(r *types.SQLiteRow, field string) (string, error) {
	values, err := Fields(r, field)
	if err != nil {
		return "", err
	}
	return values[field], nil
}
