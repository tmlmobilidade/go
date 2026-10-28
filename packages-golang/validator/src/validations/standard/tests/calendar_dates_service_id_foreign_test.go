package standard_test

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestCalendarDatesServiceIdForeign(t *testing.T) {
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
			config := validationutils.CalendarDatesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.CalendarDatesFixture(t, map[string]any{"service_id": tc.value}, config, tc.calendar...)
			if err := standard.CalendarDatesServiceIdForeign(ctx, config.Rule("calendar_dates_service_id_foreign")); err != nil {
				t.Fatal(err)
			}
			validationutils.CalendarDatesAssertFindings(t, id, "service_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingSourceColumn", func(t *testing.T) {
		config := validationutils.CalendarDatesConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.CalendarDatesFixture(t, map[string]any{}, config, "S1")
		if err := standard.CalendarDatesServiceIdForeign(ctx, config.Rule("calendar_dates_service_id_foreign")); err != nil {
			t.Fatal(err)
		}
		validationutils.CalendarDatesAssertFindings(t, id, "service_id", types.SEVERITY_ERROR, 1)
	})
	for _, tc := range []struct {
		name, setup string
	}{
		{"MissingCalendar", "DROP TABLE calendar"},
		{"MissingTargetColumn", "DROP TABLE calendar; CREATE TABLE calendar (other TEXT); INSERT INTO calendar VALUES ('S1')"},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := validationutils.CalendarDatesConfig(id, types.SEVERITY_ERROR)
			db, _ := validationutils.CalendarDatesFixture(t, map[string]any{"service_id": "S1"}, config)
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
			if err := standard.CalendarDatesServiceIdForeign(table.At(3).Context(), config.Rule("calendar_dates_service_id_foreign")); err != nil {
				t.Fatal(err)
			}
			validationutils.CalendarDatesAssertFindings(t, id, "service_id", types.SEVERITY_ERROR, 1)
		})
	}
	validationutils.CalendarDatesCheckInvalid(t, id, "service_id", standard.CalendarDatesServiceIdForeign, map[string]any{"service_id": "missing"})
}
