package fare_attributes_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_attributes/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_attributes/utils"
	"main/types"
	"testing"
)

func TestFareIdUnique(t *testing.T) {
	const id = "fare_attributes_fare_id_unique"
	for _, tc := range []struct {
		name, value string
		count       int
	}{
		{"Valid", "F1", 0},
		{"Empty", "", 0},
		{"Invalid", "F1", 1},
		{"RepeatedReferences", "F1", 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			db, ctx := testutils.Fixture(t, map[string]any{"fare_id": tc.value}, config, "A1")
			if tc.name == "RepeatedReferences" {
				if _, err := db.Exec("CREATE TABLE fare_rules (fare_id TEXT); INSERT INTO fare_rules VALUES ('F1'), ('F1')"); err != nil {
					t.Fatal(err)
				}
			}
			if tc.name == "Invalid" {
				if _, err := db.Exec("INSERT INTO fare_attributes (fare_id) VALUES (?)", tc.value); err != nil {
					t.Fatal(err)
				}
			}

			if err := checks.FareIdUnique(ctx, config.Rule("fare_attributes_fare_id_unique")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "fare_id", types.SEVERITY_ERROR, tc.count)
		})
	}
}
