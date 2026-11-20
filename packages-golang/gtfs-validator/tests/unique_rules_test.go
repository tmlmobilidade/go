package gtfsvalidator_test

import (
	"fmt"
	"slices"
	"strings"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

func TestUniqueRules(t *testing.T) {
	for _, rule := range []struct{ table, column string }{
		{"calendar", "service_id"},
		{"fare_attributes", "fare_id"},
		{"routes", "route_id"},
		{"stops", "stop_code"},
		{"stops", "stop_id"},
		{"vehicles", "vehicle_id"},
	} {
		id := rule.table + "_" + rule.column + "_unique"
		t.Run(id, func(t *testing.T) {
			config := types.Rule{RuleID: id, Severity: types.SEVERITY_WARNING}
			graph, err := rules.NewValidationGraph([]types.Rule{config})
			if err != nil {
				t.Fatal(err)
			}

			create := fmt.Sprintf("CREATE TABLE %s (%s TEXT);", rule.table, rule.column)
			insert := "INSERT INTO " + rule.table + " VALUES "
			for _, test := range []struct {
				name, setup string
				rows        [][]int
			}{
				{"duplicates", create + insert + "('1'), ('01'), ('1'), ('01'), ('1'), (NULL), (NULL), (' '), (' ');", [][]int{{1, 3}, {0, 2, 4}}},
				{"distinct", create + insert + "('1'), ('01'), ('a'), ('A'), (' a'), ('a '), (NULL), ('');", nil},
				{"missing column", fmt.Sprintf("CREATE TABLE %s (other TEXT);", rule.table), nil},
				{"missing table", "", nil},
			} {
				t.Run(test.name, func(t *testing.T) {
					db := openSQLTestDatabase(t, test.setup)
					results, err := graph.Execute(t.Context(), db, 1)
					if err != nil {
						t.Fatal(err)
					}
					result := results[0]
					status := types.Passed
					if len(test.rows) != 0 {
						status = types.Failed
					}
					if result.Status != status || len(result.Value) != len(test.rows) {
						t.Fatalf("got %+v, want %s with rows %v", result, status, test.rows)
					}

					for i, finding := range result.Value {
						if finding.FileName != rule.table+".txt" || finding.Field != rule.column ||
							finding.Severity != config.Severity || finding.Description == "" ||
							!strings.Contains(finding.Message, []string{`"01"`, `"1"`}[i]) ||
							!slices.Equal(finding.Rows, test.rows[i]) {
							t.Errorf("unexpected finding %+v, want rows %v", finding, test.rows[i])
						}
					}
				})
			}
		})
	}
}
