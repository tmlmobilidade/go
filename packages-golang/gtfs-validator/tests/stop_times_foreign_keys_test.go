package gtfsvalidator_test

import (
	"fmt"
	"reflect"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

func TestStopTimesForeignKeys(t *testing.T) {
	for _, rule := range []struct{ field, target, targetField string }{
		{"stop_id", "stops", "stop_id"},
		{"trip_id", "trips", "trip_id"},
		{"pickup_booking_rule_id", "booking_rules", "booking_rule_id"},
		{"drop_off_booking_rule_id", "booking_rules", "booking_rule_id"},
	} {
		t.Run(rule.field, func(t *testing.T) {
			const severity = types.SEVERITY_WARNING
			config := types.Rule{RuleID: "stop_times_" + rule.field + "_foreign_key_exists", Severity: severity}
			graph, err := rules.NewValidationGraph([]types.Rule{config})
			if err != nil {
				t.Fatal(err)
			}
			source := fmt.Sprintf(`CREATE TABLE stop_times (%s TEXT);
				INSERT INTO stop_times VALUES ('001'), ('1'), (NULL), (char(9, 160)), ('ABC'), ('abc'), ('1');`, rule.field)
			target := fmt.Sprintf(`CREATE TABLE %s (%s TEXT);
				INSERT INTO %s VALUES ('001'), ('001'), ('ABC'), (NULL);`, rule.target, rule.targetField, rule.target)
			shadowedRowID := fmt.Sprintf("ALTER TABLE %[1]s ADD COLUMN rowid TEXT; ALTER TABLE %[1]s ADD COLUMN _rowid_ TEXT; ALTER TABLE %[1]s ADD COLUMN oid TEXT;", rule.target)
			allSupplied := map[int]string{0: "001", 1: "1", 4: "ABC", 5: "abc", 6: "1"}
			for _, test := range []struct {
				name, setup string
				missing     map[int]string
			}{
				{"matching and missing IDs", source + target, map[int]string{1: "1", 5: "abc", 6: "1"}},
				{"custom headers on target", source + target + shadowedRowID, map[int]string{1: "1", 5: "abc", 6: "1"}},
				{"missing target table", source, allSupplied},
				{"missing target column", source + "CREATE TABLE " + rule.target + " (extra TEXT);", allSupplied},
				{"missing source column", target + "CREATE TABLE stop_times (extra TEXT); INSERT INTO stop_times VALUES ('1');", nil},
				{"missing source table", target, nil},
			} {
				t.Run(test.name, func(t *testing.T) {
					db := openSQLTestDatabase(t, test.setup)
					results, err := graph.Execute(t.Context(), db, 1)
					if err != nil {
						t.Fatal(err)
					}
					var want []types.Finding
					for row := range 7 {
						if value, missing := test.missing[row]; missing {
							want = append(want, types.Finding{
								Description:            fmt.Sprintf("The %s references a missing %s.", rule.field, rule.targetField),
								DescriptionTranslation: types.NewTranslation("missing_reference_value", map[string]any{"field": rule.field, "target_field": rule.targetField}),
								Message:                fmt.Sprintf("Unknown %s %q.", rule.targetField, value),
								MessageTranslation:     types.NewTranslation("missing_reference_value", map[string]any{"target_field": rule.targetField, "value": value}),
								Severity:               severity,
								FileName:               "stop_times.txt",
								Field:                  rule.field,
								Rows:                   []int{row},
							})
						}
					}
					wantStatus := types.Passed
					if len(want) > 0 {
						wantStatus = types.Failed
					}
					if got := results[0]; got.Status != wantStatus || !reflect.DeepEqual(got.Value, want) {
						t.Errorf("got %s with %+v, want %s with %+v", got.Status, got.Value, wantStatus, want)
					}
				})
			}
		})
	}
}
