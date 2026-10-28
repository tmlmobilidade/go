package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestServiceIdUnique(t *testing.T) {
	const id = "calendar_service_id_unique"
	for _, tc := range []struct {
		name      string
		other     string
		duplicate bool
	}{
		{"OnlyRow", "", false}, {"DifferentService", "S2", false}, {"Duplicate", "S1", true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := validationutils.CalendarConfig(id, types.SEVERITY_ERROR)
			db, ctx := validationutils.CalendarFixture(t, map[string]any{"service_id": "S1"}, config)
			if tc.other != "" {
				if _, err := db.Exec("INSERT INTO calendar (service_id) VALUES (?)", tc.other); err != nil {
					t.Fatal(err)
				}
			}
			if err := standard.ServiceIdUnique(ctx, config.Rule("calendar_service_id_unique")); err != nil {
				t.Fatal(err)
			}
			count := 0
			if tc.duplicate {
				count = 1
			}
			validationutils.CalendarAssertFindings(t, id, "service_id", types.SEVERITY_ERROR, count)
		})
	}
	for _, severity := range []types.Severity{types.SEVERITY_WARNING, types.SEVERITY_INFO, types.SEVERITY_IGNORE, types.SEVERITY_FORBIDDEN, ""} {
		t.Run("Severity/"+string(severity), func(t *testing.T) {
			config := validationutils.CalendarConfig(id, severity)
			db, ctx := validationutils.CalendarFixture(t, map[string]any{"service_id": "S1"}, config)
			if _, err := db.Exec("INSERT INTO calendar (service_id) VALUES ('S1')"); err != nil {
				t.Fatal(err)
			}
			if err := standard.ServiceIdUnique(ctx, config.Rule("calendar_service_id_unique")); err != nil {
				t.Fatal(err)
			}
			count := 1
			if severity == "" || severity == types.SEVERITY_IGNORE {
				count = 0
			}
			validationutils.CalendarAssertFindings(t, id, "service_id", severity, count)
		})
	}
	t.Run("ReadFailure", func(t *testing.T) { validationutils.CalendarAssertReadFailure(t, standard.ServiceIdUnique, id) })
}
