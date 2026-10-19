package calendar

import (
	"main/services"
	"main/types"
	validations "main/validations/calendar/validations"
	"testing"
)

func TestServiceIdValidation(t *testing.T) {
	for _, tc := range []struct {
		name     string
		values   []any
		row      int
		severity types.Severity
		issues   int
	}{
		{"MissingColumn", []any{nil}, 0, types.SEVERITY_ERROR, 1},
		{"Null", []any{nil}, 0, types.SEVERITY_ERROR, 1},
		{"Empty", []any{""}, 0, types.SEVERITY_ERROR, 1},
		{"MissingRecommended", []any{""}, 0, types.SEVERITY_WARNING, 1},
		{"UniqueWithCalendarDatesReferences", []any{"001", "002"}, 0, types.SEVERITY_ERROR, 0},
		{"Duplicate", []any{"001", "001"}, 1, types.SEVERITY_ERROR, 1},
		{"ForbiddenPresent", []any{"001"}, 0, types.SEVERITY_FORBIDDEN, 1},
		{"ForbiddenEmpty", []any{""}, 0, types.SEVERITY_FORBIDDEN, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			column := "service_id"
			if tc.name == "MissingColumn" {
				column = "fixture"
			}
			db, table := calendarTable(t, "CREATE TABLE calendar ("+column+` TEXT);
				CREATE TABLE calendar_dates (service_id TEXT);
				INSERT INTO calendar_dates VALUES ('001'), ('001');`)
			for _, value := range tc.values {
				if _, err := db.Exec("INSERT INTO calendar VALUES (?)", value); err != nil {
					t.Fatal(err)
				}
			}
			if err := validations.ServiceIdValidation(table.At(tc.row).Context(), &types.CalendarRules{RuleSection: types.RuleSection{Rules: map[string]types.RuleConfig{"calendar_service_id_unique_non_empty": types.RuleConfig{Severity: tc.severity}}}}); err != nil {
				t.Fatal(err)
			}
			messages := services.AppMessageService.GetSummary().AllMessages()
			if len(messages) != tc.issues {
				t.Fatalf("messages = %+v, want %d", messages, tc.issues)
			}
			severity := tc.severity
			if severity == types.SEVERITY_FORBIDDEN {
				severity = types.SEVERITY_ERROR
			}
			for _, message := range messages {
				if message.Severity != severity || len(message.Rows) != 1 || message.Rows[0] != tc.row+2 {
					t.Fatalf("unexpected message: %+v", message)
				}
			}
		})
	}
}
