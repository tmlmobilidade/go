package standard_test

import (
	"database/sql"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func sequenceTable(t *testing.T, sequences, distances []string) (*sql.DB, *services.SQLiteTable) {
	t.Helper()
	var rows []validationutils.TestRow
	for i, sequence := range sequences {
		values := map[string]any{"shape_id": "O'Brien", "shape_pt_sequence": sequence}
		if distances != nil {
			values["shape_dist_traveled"] = distances[i]
		}
		rows = append(rows, validationutils.TestRow{ID: 4 + i*2, Values: values})
	}
	// No coordinates are required, and malformed data in another shape is unrelated.
	rows = append(rows, validationutils.TestRow{ID: 100, Values: map[string]any{"shape_id": "other", "shape_pt_sequence": "bad"}})
	return validationutils.TestTable(t, rows...)
}
