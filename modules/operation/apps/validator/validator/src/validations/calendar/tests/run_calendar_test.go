package calendar

import (
	ruleset "main/lib/rules"
	"main/services"
	"main/types"
	calendarrunner "main/validations/calendar"
	validations "main/validations/calendar/validations"
	"reflect"
	"slices"
	"testing"
)

func TestCalendarSQLiteRulesKeepDependenciesSeveritiesAndSourceRows(t *testing.T) {
	db, _ := calendarTable(t, `CREATE TABLE calendar (service_id TEXT, start_date TEXT, end_date TEXT, monday TEXT);
		INSERT INTO calendar VALUES
		('dup', '20260101', 'invalid', '1'),
		('dup', '20260101', 'invalid', '1'),
		('', 'invalid', 'invalid', '1'),
		('single', '20260101', 'invalid', '1'),
		('', '20260101', 'invalid', '1'),
		('', 'invalid', 'invalid', '2'),
		('valid', '20260101', '20261231', '1');`)
	config := &types.GtfsRules{Calendar: types.CalendarRules{
		ServiceId: types.RuleConfig{Severity: types.SEVERITY_WARNING, DependsOn: []string{"calendar_start_date_valid_yyyymmdd"}},
		StartDate: types.RuleConfig{Severity: types.SEVERITY_ERROR, DependsOn: []string{"calendar_file_present"}},
		EndDate:   types.RuleConfig{Severity: types.SEVERITY_WARNING, DependsOn: []string{"calendar_service_id_unique_non_empty"}},
	}}
	ruleset.ConfigureMessageSeverities(config)
	t.Cleanup(func() { ruleset.ConfigureMessageSeverities(nil) })
	gtfs := types.NewGtfsFromSQLite(db, "")
	calendarrunner.RunValidations(*gtfs, config)
	expected := map[string][]int{
		"service_id": {2, 3, 6},
		"start_date": {4},
		"end_date":   {5},
		"monday":     {7},
	}
	actual := map[string][]int{}
	for _, message := range services.AppMessageService.GetSummary().AllMessages() {
		actual[message.Field] = append(actual[message.Field], message.Rows...)
		severity := types.SEVERITY_ERROR
		if message.Field == "service_id" || message.Field == "end_date" {
			severity = types.SEVERITY_WARNING
		}
		if message.Severity != severity {
			t.Fatalf("unexpected severity: %+v", message)
		}
	}
	for _, rows := range actual {
		slices.Sort(rows)
	}
	if !reflect.DeepEqual(actual, expected) {
		t.Fatalf("rows by field = %v, want %v", actual, expected)
	}
}

func TestCalendarSQLiteReadFailuresAreReturned(t *testing.T) {
	db, table := calendarTable(t, "CREATE TABLE calendar (service_id TEXT, start_date TEXT); INSERT INTO calendar VALUES ('S1', '20260101')")
	ctx := table.At(0).Context()
	db.Close()
	if err := validations.ServiceIdValidation(ctx, nil); err == nil {
		t.Error("service_id read failure was hidden")
	}
	if err := validations.DateValidation(ctx, "start_date", nil); err == nil {
		t.Error("date read failure was hidden")
	}
	if _, err := validations.WeekdaysValidation(ctx); err == nil {
		t.Error("weekday read failure was hidden")
	}
	if messages := services.AppMessageService.GetSummary().Messages; len(messages) != 0 {
		t.Fatalf("SQLite failures must not be reported as missing field values: %+v", messages)
	}
}
