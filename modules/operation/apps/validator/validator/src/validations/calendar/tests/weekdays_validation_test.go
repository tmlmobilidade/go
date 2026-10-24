package calendar

import (
	"main/services"
	"main/types"
	validations "main/validations/calendar/validations"
	"testing"
)

func TestWeekdaysValidation(t *testing.T) {
	for _, tc := range []struct {
		name   string
		values string
		valid  bool
	}{
		{"Weekdays", "'1','1','1','1','1','0','0'", true},
		{"AllDisabled", "'0','0','0','0','0','0','0'", true},
		{"AllEnabled", "'1','1','1','1','1','1','1'", true},
		{"Invalid", "'2','1','1','3','1','0','0'", false},
		{"Empty", "'',NULL,'','','','',''", true},
		{"ExistingBooleanFormats", "'true','false','TRUE','FALSE','t','f','1'", true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			_, table := calendarTable(t, `CREATE TABLE calendar (
				monday TEXT, tuesday TEXT, wednesday TEXT, thursday TEXT,
				friday TEXT, saturday TEXT, sunday TEXT);
				INSERT INTO calendar VALUES (`+tc.values+");")
			valid, err := validations.WeekdaysValidation(table.At(0).Context())
			if err != nil || valid != tc.valid {
				t.Fatalf("valid = %v, want %v, error = %v", valid, tc.valid, err)
			}
			messages := services.AppMessageService.GetSummary().AllMessages()
			if tc.valid {
				if len(messages) != 0 {
					t.Fatalf("unexpected messages: %+v", messages)
				}
				return
			}
			if len(messages) != 2 {
				t.Fatalf("messages = %+v, want invalid monday and thursday", messages)
			}
			for _, message := range messages {
				if message.RuleID != "calendar_values_parse" || message.Severity != types.SEVERITY_ERROR ||
					(message.Field != "monday" && message.Field != "thursday") || len(message.Rows) != 1 || message.Rows[0] != 2 {
					t.Fatalf("unexpected message: %+v", message)
				}
			}
		})
	}
}
