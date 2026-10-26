package vehicles_standard_test

import (
	"main/services"
	"main/types"
	checks "main/validations/vehicles/standard/checks"
	testutils "main/validations/vehicles/utils"
	"testing"
)

func TestAgencyIdForeign(t *testing.T) {
	const id = "vehicles_agency_id_foreign"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{{"Exists", map[string]any{"agency_id": "A1"}, 0},
		{"SecondAgency", map[string]any{"agency_id": "A2"}, 0},
		{"ZeroID", map[string]any{"agency_id": "0"}, 0},
		{"QuotedID", map[string]any{"agency_id": "agency'quoted"}, 0},
		{"CaseSensitive", map[string]any{"agency_id": "a1"}, 1},
		{"Whitespace", map[string]any{"agency_id": " A1 "}, 1},
		{"Missing", map[string]any{"agency_id": "missing"}, 1},
		{"SQLValue", map[string]any{"agency_id": "' OR 1=1 --"}, 1},
		{"Empty", map[string]any{"agency_id": ""}, 1},
		{"Null", map[string]any{"agency_id": nil}, 1},
		{"MissingColumn", map[string]any{}, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, tc.values, config)

			if err := checks.AgencyIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "agency_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "agency_id", checks.AgencyIdForeign, map[string]any{"agency_id": "invalid"})
}

func TestAgencyIdForeignWithoutAgencyDefinitions(t *testing.T) {
	const id = "vehicles_agency_id_foreign"
	for _, tc := range []struct {
		name string
		sql  string
	}{
		{"EmptyAgencyTable", "DELETE FROM agency"},
		{"MissingAgencyTable", "DROP TABLE agency"},
		{"MissingAgencyIdColumn", "DROP TABLE agency; CREATE TABLE agency (agency_name TEXT)"},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			db, ctx := testutils.Fixture(t, map[string]any{"agency_id": "A1"}, config)
			if _, err := db.Exec(tc.sql); err != nil {
				t.Fatal(err)
			}
			// Refresh column metadata after changing the reference table's schema.
			tables, err := services.PrepareSQLiteTables(db)
			if err != nil {
				t.Fatal(err)
			}
			table, err := tables.Table("vehicles")
			if err != nil {
				t.Fatal(err)
			}
			ctx = table.At(3).Context()
			if err := checks.AgencyIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "agency_id", types.SEVERITY_ERROR, 1)
		})
	}
}
