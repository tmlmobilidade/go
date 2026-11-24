package gtfsvalidator_test

import (
	"fmt"
	"slices"
	"strings"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

func TestTripFieldPresence(t *testing.T) {
	for _, field := range []string{"bikes_allowed", "block_id", "direction_id", "route_id", "service_id", "shape_id", "headsign", "id", "wheelchair_accessible"} {
		t.Run(field, func(t *testing.T) {
			column := field
			if field == "headsign" || field == "id" {
				column = "trip_" + field
			}
			config := types.Rule{RuleID: "trip_" + field + "_exists", Severity: types.SEVERITY_ERROR}
			checkTripRule(t, "CREATE TABLE trips (extra TEXT);", config, column, [][]int{nil})
			setup := fmt.Sprintf("CREATE TABLE trips (%s TEXT); INSERT INTO trips VALUES ('present'), (NULL), (' ');", column)
			checkTripRule(t, setup, config, column, [][]int{{1, 2}})
			config.Severity = types.SEVERITY_WARNING
			var missing [][]int
			if field == "id" || field == "route_id" || field == "service_id" {
				missing = [][]int{{1, 2}}
			}
			checkTripRule(t, setup, config, column, missing)
			config.Severity = types.SEVERITY_FORBIDDEN
			checkTripRule(t, setup, config, column, [][]int{{0}})
		})
	}
}

func TestTripEnumRules(t *testing.T) {
	for _, field := range []string{"direction_id", "wheelchair_accessible"} {
		t.Run(field, func(t *testing.T) {
			setup := fmt.Sprintf("CREATE TABLE trips (%s TEXT); INSERT INTO trips VALUES ('0'), ('1'), ('2'), ('3'), ('-1'), ('bad'), ('1.0'), (NULL), (' '), ('01');", field)
			config := types.Rule{RuleID: "trip_" + field + "_valid", Severity: types.SEVERITY_WARNING}
			want := [][]int{{3}, {4}, {5}, {6}}
			if field == "direction_id" {
				want = append([][]int{{2}}, want...)
			}
			checkTripRule(t, setup, config, field, want)
			config.Modifiers = types.RuleOptionsModifier{"all_options"}
			checkTripRule(t, setup, config, field, want)
			config.Modifiers = types.RuleOptionsModifier{"1"}
			checkTripRule(t, setup, config, field, [][]int{{0}, {2}, {3}, {4}, {5}, {6}})
			config.Modifiers = types.RuleOptionsModifier{}
			checkTripRule(t, setup, config, field, [][]int{{0}, {1}, {2}, {3}, {4}, {5}, {6}, {9}})
			config.Severity = types.SEVERITY_FORBIDDEN
			checkTripRule(t, setup, config, field, [][]int{{0}, {1}, {2}, {3}, {4}, {5}, {6}, {9}})
		})
	}
}

func TestTripIDs(t *testing.T) {
	setup := fmt.Sprintf("CREATE TABLE trips (trip_id TEXT); INSERT INTO trips VALUES ('%s'), ('%s'), ('%s'), (NULL), (' ');", strings.Repeat("a", 36), strings.Repeat("a", 37), strings.Repeat("é", 19))
	checkTripRule(t, setup, types.Rule{RuleID: "trip_id_max_length", Severity: types.SEVERITY_WARNING}, "trip_id", [][]int{{1}, {2}})
	checkTripRule(t, "CREATE TABLE trips (trip_id TEXT); INSERT INTO trips VALUES ('01'), ('1'), ('01'), ('1'), ('other'), (NULL), (NULL), (' '), (' ');", types.Rule{RuleID: "trip_id_unique", Severity: types.SEVERITY_ERROR}, "trip_id", [][]int{{0, 2}, {1, 3}})
}

func TestTripRouteLimits(t *testing.T) {
	for _, field := range []string{"trip_headsign", "shape_id"} {
		t.Run(field, func(t *testing.T) {
			setup := fmt.Sprintf(`CREATE TABLE trips (route_id TEXT, %s TEXT);
    INSERT INTO trips VALUES ('good','a'), ('good','b'), ('good','a'), ('good',NULL),
    ('bad','a'), ('bad','b'), ('bad','c'), ('other','c'), (NULL,'a'), (NULL,'b'), (NULL,'c');`, field)
			rule := "trip_shape_id_max_two_per_route"
			if field == "trip_headsign" {
				rule = "trip_headsign_max_two_per_route"
			}
			checkTripRule(t, setup, types.Rule{RuleID: rule, Severity: types.SEVERITY_WARNING}, field, [][]int{{4, 5, 6}})
		})
	}
}

func TestTripShapeIDUsesDirectionID(t *testing.T) {
	config := types.Rule{RuleID: "trip_shape_id_uses_direction_id", Severity: types.SEVERITY_WARNING}
	setup := `CREATE TABLE trips (shape_id TEXT, direction_id TEXT);
	INSERT INTO trips VALUES ('route_0', '0'), ('route_1', '1'),
	('route_0', '1'), ('route_1', '0'), ('route', '0'), ('route_10', '0'),
	('route_01', '1'), ('route_0_extra', '0'), ('route_0', '00'), ('route_1', ' 1 '),
	(NULL, '0'), (' ', '1'), ('route_0', NULL), ('route_0', ' '),
	('route_0', '2'), ('route_0', '-1'), ('route_0', 'bad'), ('route_0', '0.0');`
	checkTripRule(t, setup, config, "shape_id", [][]int{{2}, {3}, {4}, {5}, {6}, {7}})
	config.Severity = types.SEVERITY_ERROR
	checkTripRule(t, setup, config, "shape_id", [][]int{{2}, {3}, {4}, {5}, {6}, {7}})
	for _, setup := range []string{
		"CREATE TABLE trips (shape_id TEXT, direction_id TEXT); INSERT INTO trips VALUES ('route_0', '0'), ('route_1', '1');",
		"CREATE TABLE trips (shape_id TEXT); INSERT INTO trips VALUES ('route_0');",
		"CREATE TABLE trips (direction_id TEXT); INSERT INTO trips VALUES ('0');",
		"CREATE TABLE routes (route_id TEXT);",
	} {
		checkTripRule(t, setup, config, "shape_id", nil)
	}
}

func TestTripShapeReuse(t *testing.T) {
	setup := `CREATE TABLE trips (shape_id TEXT, route_id TEXT, direction_id TEXT);
 INSERT INTO trips VALUES ('ok','r1','0'), ('ok','r1','00'), ('both','r1','0'), ('both','r1','1'),
 ('shared','r1','0'), ('shared','r2','0'), ('missing',NULL,'0'), ('missing','r1',NULL), ('ok','r2','bad');`
	checkTripRule(t, setup, types.Rule{RuleID: "trips_shape_no_reuse_per_route_direction", Severity: types.SEVERITY_ERROR}, "shape_id", [][]int{{2, 3}, {4, 5}})
}

func TestTripShapeConditionalPresence(t *testing.T) {
	setup := `CREATE TABLE routes (route_id TEXT, continuous_pickup TEXT, continuous_drop_off TEXT);
 INSERT INTO routes VALUES ('pickup','0',NULL), ('dropoff',NULL,'2'), ('none','1','1');
 CREATE TABLE trips (trip_id TEXT, route_id TEXT, shape_id TEXT);
 INSERT INTO trips VALUES ('a','pickup',NULL), ('b','dropoff',' '), ('c','none',NULL),
 ('d','none',NULL), ('e','none',NULL), ('f','pickup','shape'), ('g','other',NULL);
 CREATE TABLE stop_times (trip_id TEXT, continuous_pickup TEXT, continuous_drop_off TEXT);
 INSERT INTO stop_times VALUES ('d','3',NULL), ('e',NULL,'0'), ('c','1','1'), ('g',NULL,NULL);`
	config := types.Rule{RuleID: "trip_shape_id_exists", Severity: types.SEVERITY_WARNING}
	checkTripRule(t, setup, config, "shape_id", [][]int{{0, 1, 3, 4}})
	config.Severity = types.SEVERITY_ERROR
	checkTripRule(t, setup, config, "shape_id", [][]int{{0, 1, 2, 3, 4, 6}})
	config.Severity = types.SEVERITY_FORBIDDEN
	checkTripRule(t, setup, config, "shape_id", [][]int{{5}})
	checkTripRule(t, `CREATE TABLE routes (route_id TEXT, continuous_drop_off TEXT); INSERT INTO routes VALUES ('r','0'); CREATE TABLE trips (route_id TEXT); INSERT INTO trips VALUES ('r');`, types.Rule{RuleID: "trip_shape_id_exists", Severity: types.SEVERITY_WARNING}, "shape_id", [][]int{{0}})
}

func TestTripForeignKeys(t *testing.T) {
	for _, test := range []struct{ field, references string }{
		{"route_id", "CREATE TABLE routes (route_id TEXT); INSERT INTO routes VALUES ('one'), ('two');"},
		{"shape_id", "CREATE TABLE shapes (shape_id TEXT); INSERT INTO shapes VALUES ('one'), ('one'), ('two');"},
		{"service_id", "CREATE TABLE calendar (service_id TEXT); INSERT INTO calendar VALUES ('one'); CREATE TABLE calendar_dates (service_id TEXT); INSERT INTO calendar_dates VALUES ('two'), ('two');"},
	} {
		t.Run(test.field, func(t *testing.T) {
			config := types.Rule{RuleID: "trip_" + test.field + "_foreign_key_exists", Severity: types.SEVERITY_ERROR}
			setup := fmt.Sprintf("CREATE TABLE trips (%s TEXT); INSERT INTO trips VALUES ('one'), ('two'), ('absent'), (NULL), (' ');", test.field)
			checkTripRule(t, setup+test.references, config, test.field, [][]int{{2}})
			checkTripRule(t, setup, config, test.field, [][]int{{0}, {1}, {2}})
		})
	}
	checkTripRule(t, `CREATE TABLE trips (service_id TEXT); INSERT INTO trips VALUES ('dates-only'); CREATE TABLE calendar_dates (service_id TEXT); INSERT INTO calendar_dates VALUES ('dates-only');`, types.Rule{RuleID: "trip_service_id_foreign_key_exists", Severity: types.SEVERITY_ERROR}, "service_id", nil)
}

func TestTripsFilePresence(t *testing.T) {
	config := types.Rule{RuleID: "trips_file_exists", Severity: types.SEVERITY_ERROR}
	checkTripRule(t, "CREATE TABLE routes (route_id TEXT);", config, "", [][]int{nil})
	checkTripRule(t, "CREATE TABLE trips (trip_id TEXT);", config, "", nil)
	config.Severity = types.SEVERITY_FORBIDDEN
	checkTripRule(t, "CREATE TABLE trips (trip_id TEXT);", config, "", [][]int{nil})
	checkTripRule(t, "CREATE TABLE routes (route_id TEXT);", config, "", nil)
}

func TestPatternSameShapeID(t *testing.T) {
	config := types.Rule{RuleID: "pattern_same_shape_id", Severity: types.SEVERITY_WARNING}
	const trips = "CREATE TABLE trips (route_id TEXT, direction_id TEXT, shape_id TEXT);"

	t.Run("consistent groups and skipped rows", func(t *testing.T) {
		checkTripRule(t, trips+`INSERT INTO trips VALUES
			('2006_0', '0', 'ABC'),
			('2006_0', '0', 'ABC'),
			('2006_0', '1', 'DEF'),
			('2006_0', '00', 'GHI'),
			('2007_0', '0', 'GHI'),
			('2006_0', '0', NULL),
			('2006_0', '0', ' '),
			('2006_0', NULL, 'DEF'),
			('2006_0', ' ', 'DEF'),
			('2006_0', 'bad', 'DEF'),
			('2006_0', '2', 'DEF'),
			('2006_0', '2', 'DEF'),
			(NULL, '0', 'DEF'),
			(NULL, '0', 'GHI'),
			(' ', '0', 'DEF'),
			(' ', '0', 'GHI');`, config, "shape_id", nil)
	})

	t.Run("conflicting groups", func(t *testing.T) {
		checkTripRule(t, trips+`INSERT INTO trips VALUES
			('2006_0', '0', 'ABC'),
			('2006_0', '1', 'DEF'),
			('2006_0', '0', 'THIS_IS_DIFFERENT'),
			('2006_0', '0', 'ABC'),
			('2006_0', '0', NULL),
			('2006_0', '1', 'GHI'),
			('2007_0', '0', 'JKL');`, config, "shape_id", [][]int{{0, 2, 3}, {1, 5}})
	})

	t.Run("conflicting groups with invalid directions", func(t *testing.T) {
		checkTripRule(t, trips+`INSERT INTO trips VALUES
			('2006_0', 'bad', 'ABC'),
			('2006_0', '2', 'DEF'),
			('2006_0', 'bad', 'GHI'),
			('2006_0', '2', 'JKL');`, config, "shape_id", [][]int{{0, 2}, {1, 3}})
	})

	for _, setup := range []string{
		"CREATE TABLE routes (route_id TEXT);",
		"CREATE TABLE trips (direction_id TEXT, shape_id TEXT); INSERT INTO trips VALUES ('0', 'ABC'), ('0', 'DEF');",
		"CREATE TABLE trips (route_id TEXT, shape_id TEXT); INSERT INTO trips VALUES ('2006_0', 'ABC'), ('2006_0', 'DEF');",
		"CREATE TABLE trips (route_id TEXT, direction_id TEXT); INSERT INTO trips VALUES ('2006_0', '0');",
	} {
		checkTripRule(t, setup, config, "shape_id", nil)
	}
}

func TestPatternSameTripHeadsign(t *testing.T) {
	config := types.Rule{RuleID: "pattern_same_trip_headsign", Severity: types.SEVERITY_WARNING}
	const trips = "CREATE TABLE trips (route_id TEXT, direction_id TEXT, trip_headsign TEXT);"

	t.Run("consistent groups and skipped rows", func(t *testing.T) {
		checkTripRule(t, trips+`INSERT INTO trips VALUES
			('2006_0', '0', 'Central Station'),
			('2006_0', '0', 'Central Station'),
			('2006_0', '1', 'Airport'),
			('2006_0', '00', 'City Centre'),
			('2007_0', '0', 'City Centre'),
			('2006_0', '0', NULL),
			('2006_0', '0', ' '),
			('2006_0', ' ', 'Airport'),
			('2006_0', ' ', 'City Centre'),
			(NULL, '0', 'Airport'),
			(NULL, '0', 'City Centre');`, config, "trip_headsign", nil)
	})

	t.Run("conflicting groups", func(t *testing.T) {
		checkTripRule(t, trips+`INSERT INTO trips VALUES
			('2006_0', '0', 'Central Station'),
			('2006_0', 'bad', 'Airport'),
			('2006_0', '0', 'Central station'),
			('2006_0', '0', 'Central Station'),
			('2006_0', '0', NULL),
			('2006_0', 'bad', 'City Centre');`, config, "trip_headsign", [][]int{{0, 2, 3}, {1, 5}})
	})

	for _, setup := range []string{
		"CREATE TABLE routes (route_id TEXT);",
		"CREATE TABLE trips (direction_id TEXT, trip_headsign TEXT); INSERT INTO trips VALUES ('0', 'Airport'), ('0', 'City Centre');",
		"CREATE TABLE trips (route_id TEXT, trip_headsign TEXT); INSERT INTO trips VALUES ('2006_0', 'Airport'), ('2006_0', 'City Centre');",
		"CREATE TABLE trips (route_id TEXT, direction_id TEXT); INSERT INTO trips VALUES ('2006_0', '0');",
	} {
		checkTripRule(t, setup, config, "trip_headsign", nil)
	}
}

func checkTripRule(t *testing.T, setup string, config types.Rule, field string, wantRows [][]int) {
	t.Helper()
	db := openSQLTestDatabase(t, setup)
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
	if len(wantRows) > 0 {
		wantStatus = types.Failed
	}
	if got.Status != wantStatus || len(got.Value) != len(wantRows) {
		t.Fatalf("%s at %s: got %+v; want %s and rows %v", config.RuleID, config.Severity, got, wantStatus, wantRows)
	}
	for i, finding := range got.Value {
		if finding.FileName != "trips.txt" || finding.Field != field || finding.Severity != config.Severity || !slices.Equal(finding.Rows, wantRows[i]) || finding.Message == "" || finding.Description == "" {
			t.Errorf("unexpected finding: %+v; want %s at rows %v", finding, field, wantRows[i])
		}
	}
}
