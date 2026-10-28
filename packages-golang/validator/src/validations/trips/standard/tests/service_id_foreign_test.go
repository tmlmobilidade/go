package trips_standard_test

import (
	"main/services"
	"main/types"
	checks "main/validations/trips/standard/checks"
	testutils "main/validations/trips/utils"
	"testing"
)

func TestServiceIdForeign(t *testing.T) {
	const id = "trips_service_id_foreign"
	for _, tc := range []struct {
		value string
		count int
	}{{"S1", 0},
		{"S2", 0},
		{"", 0}, {"missing", 1}, {"' OR 1=1 --", 1}} {
		t.Run(tc.value, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"service_id": tc.value}, config)
			if err := checks.ServiceIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "service_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "service_id", checks.ServiceIdForeign, map[string]any{"service_id": "missing"})
}

func TestServiceIdForeignCalendarAlternatives(t *testing.T) {
	const id = "trips_service_id_foreign"
	for _, tc := range []struct {
		name, setup string
		count       int
	}{
		{"CalendarOnly", "DROP TABLE calendar_dates", 0},
		{"DatesOnly", "DROP TABLE calendar; INSERT INTO calendar_dates VALUES ('S1')", 0},
		{"Both", "INSERT INTO calendar_dates VALUES ('S1')", 0},
		{"Neither", "DELETE FROM calendar", 1},
		{"NoTables", "DROP TABLE calendar; DROP TABLE calendar_dates", 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			db, ctx := testutils.Fixture(t, map[string]any{"service_id": "S1"}, config)
			if _, err := db.Exec(tc.setup); err != nil {
				t.Fatal(err)
			}
			// Rebuild metadata to represent a feed with only these tables.
			tables, err := services.PrepareSQLiteTables(db)
			if err != nil {
				t.Fatal(err)
			}
			table, err := tables.Table("trips")
			if err != nil {
				t.Fatal(err)
			}
			if err := checks.ServiceIdForeign(table.At(ctx.Row).Context(), config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "service_id", types.SEVERITY_ERROR, tc.count)
		})
	}
}
