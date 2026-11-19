package gtfsvalidator_test

import (
	"slices"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

func TestPatternSameStopSequence(t *testing.T) {
	const trips = `
		CREATE TABLE trips (trip_id TEXT, route_id TEXT, direction_id TEXT);
		INSERT INTO trips VALUES
			('a', '2711_0', '0'), ('b', '2711_0', '0'),
			('c', '2711_0', '1'), ('d', '2711_0', '1'),
			('e', '2712_0', '0'), ('f', '2711_0', '00');`
	const stopTimes = "CREATE TABLE stop_times (trip_id TEXT, stop_sequence TEXT);"
	const locations = "CREATE TABLE stop_times (trip_id TEXT, stop_id TEXT, stop_sequence TEXT, location_group_id TEXT, location_id TEXT);"
	const matching = `
		INSERT INTO stop_times VALUES
			('a', '0'), ('a', '1'), ('a', '2'), ('a', '3'), ('a', '4'), ('a', '5'),
			('b', '0'), ('b', '1'), ('b', '2'), ('b', '3'), ('b', '4'), ('b', '5'),
			('c', '0'), ('c', '1'), ('c', '2'), ('c', '3'), ('c', '4'), ('c', '5'),
			('d', '0'), ('d', '1'), ('d', '2'), ('d', '3'), ('d', '4'), ('d', '5');`

	for _, tt := range []struct {
		name  string
		setup string
		rows  [][]int
	}{
		{name: "matching lists in both directions", setup: trips + stopTimes + matching},
		{name: "conflicting lists in both directions", setup: trips + stopTimes + matching + `
			UPDATE stop_times SET stop_sequence = '999'
			WHERE trip_id IN ('b', 'c') AND stop_sequence = '4';`,
			rows: [][]int{{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11}, {12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23}}},
		{name: "matching lists sorted numerically", setup: trips + stopTimes + `
			INSERT INTO stop_times VALUES
				('a', '010'), ('b', '02'), ('a', '0'), ('b', '10'), ('a', '2'), ('b', '0'),
				('c', '0'), ('d', '0'), ('e', '0'), ('f', '9');`},
		{name: "shorter trip", setup: trips + stopTimes + `
			INSERT INTO stop_times VALUES
				('a', '0'), ('b', '0'), ('a', '1');`, rows: [][]int{{0, 1, 2}}},
		{name: "duplicate sequence numbers contribute to the list", setup: trips + stopTimes + `
			INSERT INTO stop_times VALUES
				('a', '0'), ('a', '1'), ('b', '0'), ('b', '00');`, rows: [][]int{{0, 1, 2, 3}}},
		{name: "renumbered stops with nonstandard direction", setup: trips + stopTimes + `
			UPDATE trips SET direction_id = 'bad' WHERE trip_id IN ('a', 'b');
			INSERT INTO stop_times VALUES
				('a', '0'), ('b', '0'), ('a', '1'), ('b', '2');`, rows: [][]int{{0, 1, 2, 3}}},
		{name: "location columns do not affect the hash", setup: trips + locations + `
			INSERT INTO stop_times VALUES
				('a', 'start', '1', 'region', NULL), ('b', 'other', '1', NULL, 'area'),
				('a', NULL, '2', NULL, 'area'), ('b', NULL, '2', NULL, NULL);`},
		{name: "unavailable and ambiguous sequences", setup: trips + stopTimes + `
			INSERT INTO trips VALUES
				('ambiguous', '2711_0', '0'), ('ambiguous', '2711_0', '1'),
				('no-direction', '2711_0', ' '), ('no-route', NULL, '0'),
				('no-sequence', '2711_0', '0');
			INSERT INTO stop_times VALUES
				('a', '0'), ('a', '1'), ('b', '0'), ('b', NULL),
				('ambiguous', '4'), ('no-direction', '4'), ('no-route', '4'),
				('no-sequence', '0'), ('no-sequence', 'bad'), ('unknown-trip', '4');`},
		{name: "missing trips table", setup: stopTimes},
		{name: "missing stop times table", setup: trips},
		{name: "missing sequence column", setup: trips + "CREATE TABLE stop_times (trip_id TEXT); INSERT INTO stop_times VALUES ('a'), ('b');"},
	} {
		t.Run(tt.name, func(t *testing.T) {
			db := openSQLTestDatabase(t, tt.setup)
			config := types.Rule{RuleID: "pattern_same_stop_sequence", Severity: types.SEVERITY_WARNING}
			graph, err := rules.NewValidationGraph([]types.Rule{config})
			if err != nil {
				t.Fatal(err)
			}
			results, err := graph.Execute(t.Context(), db, 1)
			if err != nil {
				t.Fatal(err)
			}
			wantStatus := types.Passed
			if len(tt.rows) > 0 {
				wantStatus = types.Failed
			}
			got := results[0]
			if got.Status != wantStatus || len(got.Value) != len(tt.rows) {
				t.Fatalf("got %+v, want %s and rows %v", got, wantStatus, tt.rows)
			}
			for i, finding := range got.Value {
				if finding.FileName != "stop_times.txt" || finding.Field != "stop_sequence" || finding.Severity != config.Severity || !slices.Equal(finding.Rows, tt.rows[i]) || finding.Message == "" || finding.Description == "" {
					t.Errorf("unexpected finding %+v, want stop_times.txt stop_sequence at rows %v", finding, tt.rows[i])
				}
			}
		})
	}
}
