package calendar_dates_standard_test

import (
	"main/services"
	"main/types"
	checks "main/validations/calendar_dates/standard/checks"
	testutils "main/validations/calendar_dates/utils"
	"testing"
)

func TestServiceIdForeign(t *testing.T) {
	const id = "calendar_dates_service_id_foreign"
	for _, tc := range []struct {
		name     string
		value    any
		calendar []string
		count    int
	}{
		{"Present", "S1", []string{"S1"}, 0},
		{"LaterRow", "S2", []string{"S1", "S2"}, 0},
		{"Missing", "S3", []string{"S1", "S2"}, 1},
		{"EmptyCalendar", "S1", nil, 1},
		{"DuplicateTarget", "S1", []string{"S1", "S1"}, 0},
		{"ExactMatch", "s1", []string{"S1"}, 1},
		{"QuotedID", "S'1", []string{"S'1"}, 0},
		{"BoundParameter", "' OR 1=1 --", []string{"S1"}, 1},
		{"Empty", "", []string{"S1"}, 1},
		{"Null", nil, []string{"S1"}, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"service_id": tc.value}, config, tc.calendar...)
			if err := checks.ServiceIdForeign(ctx, config); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "service_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingSourceColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, map[string]any{}, config, "S1")
		if err := checks.ServiceIdForeign(ctx, config); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "service_id", types.SEVERITY_ERROR, 1)
	})
	for _, tc := range []struct {
		name, setup string
		wantError   bool
	}{
		{"MissingCalendar", "DROP TABLE calendar", true},
		{"MissingTargetColumn", "DROP TABLE calendar; CREATE TABLE calendar (other TEXT); INSERT INTO calendar VALUES ('S1')", false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			db, _ := testutils.Fixture(t, map[string]any{"service_id": "S1"}, config)
			if _, err := db.Exec(tc.setup); err != nil {
				t.Fatal(err)
			}
			tables, err := services.PrepareSQLiteTables(db)
			if err != nil {
				t.Fatal(err)
			}
			table, err := tables.Table("calendar_dates")
			if err != nil {
				t.Fatal(err)
			}
			err = checks.ServiceIdForeign(table.At(3).Context(), config)
			if (err != nil) != tc.wantError {
				t.Fatalf("error=%v, wantError=%v", err, tc.wantError)
			}
			count := 1
			if tc.wantError {
				count = 0
			}
			testutils.AssertFindings(t, id, "service_id", types.SEVERITY_ERROR, count)
		})
	}
	testutils.CheckInvalid(t, id, "service_id", checks.ServiceIdForeign, map[string]any{"service_id": "missing"})
}
