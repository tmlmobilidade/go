package trips_test

import (
	"database/sql"
	"fmt"
	"main/lib/rules"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	"main/validations/trips"
	"path/filepath"
	"strings"
	"testing"
)

func TestRouteAssociationBindingsAndDependencies(t *testing.T) {
	for _, prerequisiteSeverity := range []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING} {
		t.Run(string(prerequisiteSeverity), func(t *testing.T) {
			services.AppMessageService.Clear()
			data := []map[string]string{}
			for _, route := range []string{"R1", "R2", "R3"} {
				for index, value := range []string{"A", "B", "C"} {
					// R2 has only two distinct values, one per direction.
					direction := "0"
					if index == 2 {
						direction = "1"
					}
					if route == "R2" && index == 1 {
						value = "A"
					}
					// An invalid direction blocks only R3's direction checks.
					if route == "R3" && index == 0 {
						direction = "2"
					}
					data = append(data, map[string]string{
						"trip_id": fmt.Sprintf("%s-%d", route, index), "route_id": route,
						"shape_id": value, "trip_headsign": value, "direction_id": direction,
					})
				}
			}
			gtfs, cleanup, err := (test_helpers.MockGtfs{
				TableData: map[string][]map[string]string{
					"trips":  data,
					"routes": {{"route_id": "R1"}, {"route_id": "R2"}, {"route_id": "R3"}},
				},
				IdMapData: types.GtfsIdMap{
					"routes": {"R1": {1}, "R2": {2}, "R3": {3}},
					"shapes": {"A": {1}, "B": {2}, "C": {3}},
				},
			}).ToGtfsWithDB()
			if err != nil {
				t.Fatal(err)
			}
			t.Cleanup(cleanup)
			// Row iteration and foreign-key lookups use separate SQL connections.
			// A file database lets both connections see the same fixture.
			dbPath := filepath.Join(t.TempDir(), "gtfs.sqlite")
			if _, err := gtfs.DB().Exec("VACUUM INTO ?", dbPath); err != nil {
				t.Fatal(err)
			}
			db, err := sql.Open("sqlite", dbPath)
			if err != nil {
				t.Fatal(err)
			}
			t.Cleanup(func() { db.Close() })
			idMap := gtfs.IdMap
			gtfs = types.NewGtfsFromSQLite(db, dbPath)
			gtfs.IdMap = idMap
			config := rules.DefaultConfig()
			config.Trips.RouteId.Severity = types.SEVERITY_ERROR
			config.Trips.ShapeId.Severity = types.SEVERITY_ERROR
			config.Trips.TripHeadsign.Severity = types.SEVERITY_ERROR
			config.Trips.DirectionId.Severity = prerequisiteSeverity
			config.Trips.ShapeIdMaxTwoPerRoute.Severity = types.SEVERITY_ERROR
			config.Trips.TripHeadsignMaxTwoPerRoute.Severity = types.SEVERITY_WARNING
			config.Trips.ShapeIdConsistentPerRouteDirection.Severity = types.SEVERITY_ERROR
			config.Trips.TripHeadsignConsistentPerRouteDirection.Severity = types.SEVERITY_WARNING
			rules.ConfigureMessageSeverities(&config)
			t.Cleanup(func() { rules.ConfigureMessageSeverities(nil); services.AppMessageService.Clear() })
			trips.RunValidations(*gtfs, &config)
			counts := map[string]int{}
			for _, message := range services.AppMessageService.GetSummary().Messages {
				counts[message.RuleID]++
				if strings.Contains(message.RuleID, "per_route") {
					if strings.Contains(message.Message, `"R2"`) {
						t.Fatalf("unrelated route failed: %+v", message)
					}
					if strings.Contains(message.RuleID, "direction") && strings.Contains(message.Message, `"R3"`) {
						t.Fatalf("failed prerequisite did not block route: %+v", message)
					}
					if strings.Contains(message.RuleID, "trip_headsign") && message.Severity != types.SEVERITY_WARNING {
						t.Fatalf("severity ignored: %+v", message)
					}
					if len(message.Rows) != 1 || (message.Rows[0] != 2 && message.Rows[0] != 8) {
						t.Fatalf("incorrect route row: %+v", message)
					}
				}
			}
			want := map[string]int{
				"trips_direction_id_valid_enum":                 1,
				"trips_shape_id_max_two_per_route":              2,
				"trip_headsign_max_two_per_route":               2,
				"trips_shape_id_consistent_per_route_direction": 1,
				"trip_headsign_consistent_per_route_direction":  1,
			}
			if len(counts) != len(want) {
				t.Fatalf("unexpected rules: %v; messages: %+v", counts, services.AppMessageService.GetSummary().Messages)
			}
			for id, count := range want {
				if counts[id] != count {
					t.Errorf("%s: got %d, want %d", id, counts[id], count)
				}
			}
		})
	}
}
