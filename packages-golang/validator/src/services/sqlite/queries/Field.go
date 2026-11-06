package queries

import types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"

// Field reads a field from the current row.
func Field(r *types.SQLiteRow, field string) (string, error) {
	//

	//
	// 1. Get the fields

	values, err := Fields(r, field)
	if err != nil {
		return "", err
	}

	//
	// 2. Return the value

	return values[field], nil
}
