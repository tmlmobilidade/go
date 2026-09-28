package trips_test

import (
	"database/sql"
	"main/lib/rules"
	"main/services"
	"main/types"
	"main/validations/trips"
	"path/filepath"
	"strings"
	"testing"
)

func TestShapeIdRouteDirectionMatchBindingAndDependencies(t *testing.T) {
	for _, severity := range []types.Severity{types.SEVERITY_WARNING, types.SEVERITY_ERROR} {
		t.Run(string(severity), func(t *testing.T) {
			dbPath := filepath.Join(t.TempDir(), "gtfs.sqlite")
			db, err := sql.Open("sqlite", dbPath)
			if err != nil {
				t.Fatal(err)
			}
			t.Cleanup(func() { db.Close() })
			for _, query := range []string{
				`CREATE TABLE trips (trip_id TEXT, route_id TEXT, direction_id TEXT, shape_id TEXT)`,
				`CREATE TABLE routes (route_id TEXT)`,
				`CREATE TABLE id_map (file TEXT, key TEXT, row_index INTEGER)`,
				`INSERT INTO routes VALUES ('1001')`,
				`INSERT INTO id_map VALUES ('routes', '1001', 0)`,
				`INSERT INTO trips VALUES
				('valid-out', '1001', '0', '1001_0'),
				('valid-in', '1001', '1', '1001_1'),
				('mismatch', '1001', '0', '1001_1'),
				('bad-direction', '1001', '2', '1001_1'),
				('missing-route', '', '0', '1001_1'),
				('missing-shape', '1001', '0', ''),
				('unknown-shape', '1001', '0', 'other')`,
			} {
				if _, err := db.Exec(query); err != nil {
					t.Fatal(err)
				}
			}
			gtfs := types.NewGtfsFromSQLite(db, dbPath)
			gtfs.IdMap = types.GtfsIdMap{"shapes": {"1001_0": {0}, "1001_1": {1}}}
			// Decode the same partial JSON accepted from agency settings.
			config, err := rules.DecodeConfig([]byte(`{"trips":{"trips_shape_id_matches_route_id_and_direction_id":{"severity":"warning"}}}`))
			if err != nil {
				t.Fatal(err)
			}
			config.Trips.RouteId.Severity = severity
			config.Trips.DirectionId.Severity = severity
			config.Trips.ShapeId.Severity = severity
			rules.ConfigureMessageSeverities(&config)
			services.AppMessageService.Clear()
			t.Cleanup(func() { rules.ConfigureMessageSeverities(nil); services.AppMessageService.Clear() })
			trips.RunValidations(*gtfs, &config)
			counts := map[string]int{}
			for _, message := range services.AppMessageService.GetSummary().Messages {
				counts[message.RuleID]++
				if message.RuleID != "trips_shape_id_matches_route_id_and_direction_id" {
					continue
				}
				if message.Severity != types.SEVERITY_WARNING || len(message.Rows) != 1 || message.Rows[0] != 4 || !strings.Contains(message.Message, "1001_0") {
					t.Fatalf("unexpected mismatch: %+v", message)
				}
			}
			want := map[string]int{
				"trips_shape_id_matches_route_id_and_direction_id":    1,
				"trips_direction_id_valid_enum":                       1,
				"trips_route_id_references_routes_table":              1,
				"trips_shape_id_references_shapes_table_when_present": 2,
			}
			if len(counts) != len(want) {
				t.Fatalf("unexpected messages: %+v", services.AppMessageService.GetSummary().Messages)
			}
			for id, count := range want {
				if counts[id] != count {
					t.Errorf("%s: got %d, want %d", id, counts[id], count)
				}
			}
		})
	}
}
