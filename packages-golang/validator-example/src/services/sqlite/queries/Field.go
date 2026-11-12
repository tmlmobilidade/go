package queries

import types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/sqlite"

/*
* Field reads one named value through Fields, reusing prefetched row values when
* available. Missing columns and SQL NULL cells become empty strings.
* Row lookup, schema and database errors are returned unchanged.
 */
func Field(r *types.SQLiteRow, field string) (string, error) {
	//

	//
	// 1. Reuse the shared field reader for the requested column

	values, err := Fields(r, field)
	if err != nil {
		return "", err
	}

	//
	// 2. Return the value

	return values[field], nil
}
