package custom_test

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

type scenario struct {
	name    string
	values  map[string]any
	sql     string
	options []string
	count   int
}

func runCases(t *testing.T, id, field, file string, check validationutils.TripsCheck, cases []scenario) {
	t.Helper()
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			config := validationutils.TripsConfig(id, types.SEVERITY_ERROR)
			if tc.options != nil {
				config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR, Options: &tc.options})
			}
			values := map[string]any{"trip_id": "T1", "route_id": "R1", "service_id": "S1", "pattern_id": "R1_0_1", "shape_id": "R1_0", "direction_id": "0", "trip_headsign": "Terminal", "trip_short_name": "", "block_id": "", "bikes_allowed": "0", "wheelchair_accessible": "0"}
			for field, value := range tc.values {
				values[field] = value
			}
			db, ctx := validationutils.TripsFixture(t, values, config)
			if tc.sql != "" {
				if _, err := db.Exec(tc.sql); err != nil {
					t.Fatal(err)
				}
			}
			if err := check(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			messages := services.AppMessageService.GetSummary().AllMessages()
			if got := services.AppMessageService.RuleIssueCount(id); got != uint64(tc.count) {
				t.Fatalf("%s findings=%d, want %d: %+v", id, got, tc.count, messages)
			}
			for _, message := range messages {
				if message.RuleID != id || message.Field != field || message.FileName != file || message.Severity != types.SEVERITY_ERROR || len(message.Rows) == 0 {
					t.Fatalf("unexpected finding: %+v", message)
				}
			}
		})
	}
	t.Run("ReadFailure", func(t *testing.T) { validationutils.TripsAssertReadFailure(t, check, id) })
}
