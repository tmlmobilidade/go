package gtfsvalidator_test

import (
	"slices"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

func TestTripBikesAllowedValid(t *testing.T) {
	const values = `CREATE TABLE trips (bikes_allowed TEXT);
		INSERT INTO trips VALUES ('0'), ('1'), ('2'), (NULL), (''), (' '),
		('3'), ('-1'), ('1.0'), ('bike'), (' 1 '), ('01');`
	for _, test := range []struct {
		name     string
		setup    string
		severity types.Severities
		modifier types.RuleModifier
		wantRows []int
	}{
		{"enum", values, types.SEVERITY_WARNING, nil, []int{6, 7, 8, 9}},
		{"restricted options", values, types.SEVERITY_ERROR, types.RuleOptionsModifier{"2"}, []int{0, 1, 6, 7, 8, 9, 10, 11}},
		{"all options still checks enum", values, types.SEVERITY_WARNING, types.RuleOptionsModifier{"all_options"}, []int{6, 7, 8, 9}},
		{"empty options", values, types.SEVERITY_WARNING, types.RuleOptionsModifier{}, []int{0, 1, 2, 6, 7, 8, 9, 10, 11}},
		{"forbidden", values, types.SEVERITY_FORBIDDEN, nil, []int{0, 1, 2, 6, 7, 8, 9, 10, 11}},
		{"valid and blank", "CREATE TABLE trips (bikes_allowed TEXT); INSERT INTO trips VALUES ('0'), ('1'), ('2'), (NULL), ('');", types.SEVERITY_ERROR, nil, nil},
		{"missing column", "CREATE TABLE trips (trip_id TEXT); INSERT INTO trips VALUES ('one');", types.SEVERITY_ERROR, nil, nil},
		{"missing table", "CREATE TABLE routes (route_id TEXT);", types.SEVERITY_ERROR, nil, nil},
	} {
		t.Run(test.name, func(t *testing.T) {
			db := openSQLTestDatabase(t, test.setup)
			config := types.Rule{RuleID: "trip_bikes_allowed_valid", Severity: test.severity, Modifiers: test.modifier}
			graph, err := rules.NewValidationGraph([]types.Rule{config})
			if err != nil {
				t.Fatal(err)
			}
			results, err := graph.Execute(t.Context(), db, 1)
			if err != nil {
				t.Fatal(err)
			}
			got := results[0]
			wantStatus := types.Passed
			if len(test.wantRows) > 0 {
				wantStatus = types.Failed
			}
			if got.Status != wantStatus || len(got.Value) != len(test.wantRows) {
				t.Fatalf("got %+v, want status %s and findings at rows %v", got, wantStatus, test.wantRows)
			}
			for i, finding := range got.Value {
				if finding.FileName != "trips.txt" || finding.Field != "bikes_allowed" ||
					finding.Severity != test.severity || !slices.Equal(finding.Rows, []int{test.wantRows[i]}) ||
					finding.Description == "" || finding.Message == "" {
					t.Errorf("unexpected finding: %+v", finding)
				}
			}
		})
	}
}
