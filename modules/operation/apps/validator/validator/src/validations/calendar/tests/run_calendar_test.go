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
 ('dup', '20260101', '20261231', '1'),
 ('dup', 'invalid', '20261231', '1'),
 ('', '20260101', '20261231', '1'),
 ('single', '20261231', '20260101', '2'),
 ('valid', '20260101', '20261231', '1');`)
	config := &types.GtfsRules{}
	*config = map[string]types.RuleContext{
		"calendar_service_id_field":             {Severity: types.SEVERITY_INFO},
		"calendar_start_date_field":             {Severity: types.SEVERITY_ERROR},
		"calendar_end_date_field":               {Severity: types.SEVERITY_ERROR},
		"calendar_start_end_dates_valid_format": {Severity: types.SEVERITY_ERROR, DependsOn: []string{"calendar_start_date_field", "calendar_end_date_field"}},
		"calendar_start_end_dates_valid":        {Severity: types.SEVERITY_WARNING, DependsOn: []string{"calendar_start_end_dates_valid_format"}},
		"calendar_service_id_unique":            {Severity: types.SEVERITY_WARNING, DependsOn: []string{"calendar_service_id_field", "calendar_start_end_dates_valid_format"}},
		"calendar_monday_valid":                 {Severity: types.SEVERITY_ERROR},
	}
	ruleset.ConfigureMessageSeverities(config)
	t.Cleanup(func() { ruleset.ConfigureMessageSeverities(nil) })
	gtfs := types.NewGtfsFromSQLite(db, "")
	calendarrunner.RunValidations(*gtfs, config)
	expected := map[string][]int{
		"calendar_service_id_unique":            {2},
		"calendar_start_end_dates_valid_format": {3},
		"calendar_service_id_field":             {4},
		"calendar_start_end_dates_valid":        {5},
		"calendar_monday_valid":                 {5},
	}
	actual := map[string][]int{}
	for _, message := range services.AppMessageService.GetSummary().AllMessages() {
		actual[message.RuleID] = append(actual[message.RuleID], message.Rows...)
		if message.Severity != config.Rule(message.RuleID).Severity || message.FileName != "calendar.txt" {
			t.Fatalf("unexpected finding: %+v", message)
		}
	}
	for _, rows := range actual {
		slices.Sort(rows)
	}
	if !reflect.DeepEqual(actual, expected) {
		t.Fatalf("rows by rule = %v, want %v", actual, expected)
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
