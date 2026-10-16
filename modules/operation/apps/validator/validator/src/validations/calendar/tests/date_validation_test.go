package calendar

import (
	"main/services"
	dbops "main/services/database"
	"main/types"
	validations "main/validations/calendar/validations"
	"testing"
)

func TestDateValidation(t *testing.T) {
	for _, field := range []string{"start_date", "end_date"} {
		for _, tc := range []struct {
			name     string
			value    any
			severity types.Severity
			issues   int
		}{
			{"MissingColumn", nil, types.SEVERITY_ERROR, 1},
			{"Null", nil, types.SEVERITY_ERROR, 1},
			{"Empty", "", types.SEVERITY_ERROR, 1},
			{"Valid", "20261016", types.SEVERITY_ERROR, 0},
			{"LeapDay", "20240229", types.SEVERITY_ERROR, 0},
			{"InvalidFormat", "2026-10-16", types.SEVERITY_ERROR, 1},
			{"InvalidDay", "20260229", types.SEVERITY_ERROR, 1},
			{"Whitespace", " 20261016", types.SEVERITY_ERROR, 1},
			{"MissingRecommended", "", types.SEVERITY_WARNING, 1},
			{"ForbiddenPresent", "20261016", types.SEVERITY_FORBIDDEN, 1},
			{"ForbiddenEmpty", "", types.SEVERITY_FORBIDDEN, 0},
		} {
			t.Run(field+"/"+tc.name, func(t *testing.T) {
				columns := "fixture TEXT"
				if tc.name != "MissingColumn" {
					columns += ", " + dbops.SanitizeColumnName(field) + " TEXT"
				}
				db, table := calendarTable(t, "CREATE TABLE calendar ("+columns+"); INSERT INTO calendar (rowid) VALUES (4)")
				if tc.name != "MissingColumn" {
					if _, err := db.Exec("UPDATE calendar SET "+dbops.SanitizeColumnName(field)+" = ?", tc.value); err != nil {
						t.Fatal(err)
					}
				}
				config := &types.CalendarRules{}
				if field == "start_date" {
					config.StartDate.Severity = tc.severity
				} else {
					config.EndDate.Severity = tc.severity
				}
				if err := validations.DateValidation(table.At(3).Context(), field, config); err != nil {
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
					if message.Field != field || message.Severity != severity || len(message.Rows) != 1 || message.Rows[0] != 5 {
						t.Fatalf("unexpected message: %+v", message)
					}
				}
			})
		}
	}
}
