package gtfsvalidator_test

import (
	"fmt"
	"slices"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

func TestPatternSameStopDistTraveled(t *testing.T) {
	const trips = `
		CREATE TABLE trips (route_id TEXT, direction_id TEXT, trip_id TEXT);
		INSERT INTO trips VALUES
			('2711_0', '0', 'out-0500'), ('2711_0', '0', 'out-0515'),
			('2711_0', '1', 'in-0530'), ('2711_0', '1', 'in-0545'),
			('2712_0', '0', 'other-route'), ('2711_0', '00', 'other-direction');`
	const stopTimes = "CREATE TABLE stop_times (trip_id TEXT, stop_sequence TEXT, shape_dist_traveled TEXT);"
	const matchingStops = `
		INSERT INTO stop_times VALUES
			('out-0500', '4', '1778'),
			('in-0545', '4', '%s'),
			('out-0515', '0', '-0.0'),
			('out-0500', '0', '0'),
			('out-0515', '04', '%s'),
			('in-0530', '4', '2217'),
			('out-0500', '10', '2431'),
			('out-0515', '10', '2431'),
			('other-route', '4', '3000'),
			('other-direction', '4', '4000');`

	for _, tt := range []struct {
		name  string
		setup string
		rows  [][]int
	}{
		{name: "equal numeric distances", setup: trips + stopTimes + fmt.Sprintf(matchingStops, "2217", "1778.0")},
		{name: "conflicting distances in both directions", setup: trips + stopTimes + fmt.Sprintf(matchingStops, "9999", "9999"), rows: [][]int{{0, 2, 3, 4, 6, 7}, {1, 5}}},
		{name: "location fields and sequence labels do not affect the hash", setup: trips + stopTimes + `
			ALTER TABLE stop_times ADD COLUMN stop_id TEXT;
			ALTER TABLE stop_times ADD COLUMN location_group_id TEXT;
			ALTER TABLE stop_times ADD COLUMN location_id TEXT;
			INSERT INTO stop_times VALUES
				('out-0500', '4', '1778', 'stop', 'area', NULL),
				('out-0515', '10', '0', NULL, NULL, NULL),
				('out-0500', '0', '0', 'other-stop', NULL, NULL),
				('out-0515', '12', '1778.0', NULL, NULL, 'zone');`},
		{name: "distance order matters", setup: trips + stopTimes + `
			INSERT INTO stop_times VALUES
				('out-0500', '0', '0'), ('out-0500', '1', '1778'),
				('out-0515', '1', '0'), ('out-0515', '0', '1778');`, rows: [][]int{{0, 1, 2, 3}}},
		{name: "shorter distance list", setup: trips + stopTimes + `
			INSERT INTO stop_times VALUES
				('out-0500', '0', '0'), ('out-0500', '1', '1778'),
				('out-0515', '0', '0');`, rows: [][]int{{0, 1, 2}}},
		{name: "nonstandard direction still forms a group", setup: trips + stopTimes + `
			UPDATE trips SET direction_id = 'bad' WHERE trip_id LIKE 'out-%';
			INSERT INTO stop_times VALUES ('out-0500', '4', '1778'), ('out-0515', '4', '9999');`, rows: [][]int{{0, 1}}},
		{name: "unmatched and incomplete trips", setup: trips + stopTimes + `
			INSERT INTO trips VALUES
				('2711_0', NULL, 'no-direction'),
				('2711_0', '0', 'ambiguous'), ('2711_0', '1', 'ambiguous'),
				('2711_0', '0', 'bad-sequence'), ('2711_0', '0', 'bad-distance'),
				('2711_0', '0', 'nan-distance'), ('2711_0', '0', 'inf-distance');
			INSERT INTO stop_times VALUES
				('out-0500', '4', '1778'),
				('out-0515', '4', '9999'), ('out-0515', '5', NULL),
				('bad-sequence', 'bad', '9999'), ('bad-distance', '4', 'bad'),
				('nan-distance', '4', 'NaN'), ('inf-distance', '4', 'Inf'),
				('unknown-trip', '4', '9999'),
				('no-direction', '4', '9999'),
				('ambiguous', '4', '9999');`},
		{name: "duplicate sequences ordered by distance", setup: trips + stopTimes + `
			INSERT INTO stop_times VALUES
				('out-0500', '4', '1778'), ('out-0500', '4', '9999'),
				('out-0515', '4', '9999'), ('out-0515', '4', '1778');`},
		{name: "missing trips table", setup: stopTimes},
		{name: "missing stop times table", setup: trips},
		{name: "missing distance column", setup: trips + "CREATE TABLE stop_times (trip_id TEXT, stop_sequence TEXT);"},
	} {
		t.Run(tt.name, func(t *testing.T) {
			db := openSQLTestDatabase(t, tt.setup)
			graph, err := rules.NewValidationGraph([]types.Rule{{RuleID: "pattern_same_stop_dist_traveled", Severity: types.SEVERITY_WARNING}})
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
				if finding.FileName != "stop_times.txt" || finding.Field != "shape_dist_traveled" || finding.Severity != types.SEVERITY_WARNING || !slices.Equal(finding.Rows, tt.rows[i]) || finding.Message == "" || finding.Description == "" {
					t.Errorf("unexpected finding %+v, want stop_times.txt shape_dist_traveled at rows %v", finding, tt.rows[i])
				}
			}
		})
	}
}
