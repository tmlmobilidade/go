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
	const stopTimes = "CREATE TABLE stop_times (trip_id TEXT, stop_id TEXT, stop_sequence TEXT, shape_dist_traveled TEXT);"
	const locations = "CREATE TABLE stop_times (trip_id TEXT, stop_id TEXT, stop_sequence TEXT, location_group_id TEXT, location_id TEXT);"

	for _, tt := range []struct {
		name  string
		setup string
		rows  [][]int
	}{
		{name: "matching stops sorted numerically", setup: trips + stopTimes + `
			INSERT INTO stop_times VALUES
				('a', 'start', '010', '300'), ('b', 'middle', '02', '100'),
				('a', 'start', '0', '0'), ('b', 'start', '10', '9999'),
				('a', 'middle', '2', '100'), ('b', 'start', '0', '0'),
				('c', 'inbound', '0', '0'), ('d', 'inbound', '0', '0'),
				('e', 'other-route', '0', '0'), ('f', 'other-direction', '0', '0');`},
		{name: "changed stop and shorter trip", setup: trips + stopTimes + `
			INSERT INTO stop_times VALUES
				('a', 'start', '0', '0'), ('c', 'inbound', '0', '0'),
				('b', 'start', '0', '0'), ('d', 'inbound', '0', '0'),
				('a', 'end', '1', '100'), ('c', 'extra', '1', '100'),
				('b', 'other-stop', '1', '100');`, rows: [][]int{{0, 2, 4, 6}, {1, 3, 5}}},
		{name: "renumbered stops with nonstandard direction", setup: trips + stopTimes + `
			UPDATE trips SET direction_id = 'bad' WHERE trip_id IN ('a', 'b');
			INSERT INTO stop_times VALUES
				('a', 'start', '0', '0'), ('b', 'start', '0', '0'),
				('a', 'end', '1', '100'), ('b', 'end', '2', '100');`, rows: [][]int{{0, 1, 2, 3}}},
		{name: "matching location groups and GeoJSON locations", setup: trips + locations + `
			INSERT INTO stop_times VALUES
				('a', NULL, '1', 'region', NULL), ('b', NULL, '1', 'region', NULL),
				('a', NULL, '2', NULL, 'area'), ('b', NULL, '2', NULL, 'area');`},
		{name: "location types distinguish the same ID", setup: trips + locations + `
			INSERT INTO stop_times VALUES ('a', NULL, '1', 'region', NULL), ('b', NULL, '1', NULL, 'region');`, rows: [][]int{{0, 1}}},
		{name: "unavailable and ambiguous sequences", setup: trips + locations + `
			INSERT INTO trips VALUES
				('ambiguous', '2711_0', '0'), ('ambiguous', '2711_0', '1'),
				('no-direction', '2711_0', ' '), ('no-route', NULL, '0'),
				('no-location', '2711_0', '0'), ('multiple-locations', '2711_0', '0'),
				('no-sequence', '2711_0', '0');
			INSERT INTO stop_times VALUES
				('a', 'start', '0', NULL, NULL), ('a', 'end', '1', NULL, NULL),
				('b', 'changed', '0', NULL, NULL), ('b', 'changed', '00', NULL, NULL),
				('ambiguous', 'changed', '0', NULL, NULL),
				('no-direction', 'changed', '0', NULL, NULL),
				('no-route', 'changed', '0', NULL, NULL),
				('no-location', NULL, '0', NULL, NULL),
				('no-location', 'changed', '1', NULL, NULL),
				('multiple-locations', 'changed', '0', 'region', NULL),
				('multiple-locations', 'changed', '1', NULL, NULL),
				('no-sequence', 'changed', '0', NULL, NULL),
				('no-sequence', 'end', 'bad', NULL, NULL),
				('unknown-trip', 'changed', '0', NULL, NULL);`},
		{name: "missing trips table", setup: stopTimes},
		{name: "missing stop times table", setup: trips},
		{name: "missing sequence column", setup: trips + "CREATE TABLE stop_times (trip_id TEXT, stop_id TEXT); INSERT INTO stop_times VALUES ('a', 'start'), ('b', 'end');"},
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
