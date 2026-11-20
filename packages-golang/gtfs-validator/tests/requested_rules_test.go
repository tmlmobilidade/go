package gtfsvalidator_test

import (
	"fmt"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	validator "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	importgtfs "github.com/tmlmobilidade/go/packages-golang/import-gtfs/src"
)

func TestRequestedRulesThroughGraph(t *testing.T) {
	const stopLocationTypes = `CREATE TABLE stops (location_type TEXT, parent_station TEXT, platform_code TEXT);
		INSERT INTO stops VALUES ('0', 'station', 'A'), ('1', 'station', 'B'), ('1', ' ', NULL),
		('2', NULL, 'C'), ('3', '', 'D'), ('4', ' ', 'E'), ('2', 'station', NULL),
		('3', 'station', NULL), ('4', 'platform', ' '), ('01', 'station', 'F'),
		(' 0 ', NULL, 'G'), (NULL, NULL, 'H'), (' ', NULL, 'I'),
		('bad', 'station', 'J'), ('5', NULL, 'K');`
	const stopDistanceOrder = `CREATE TABLE stop_times (trip_id TEXT, stop_sequence TEXT, shape_dist_traveled TEXT);
		INSERT INTO stop_times VALUES ('a', '10', '5'), ('b', '10', '6'), ('a', '2', '5.0'),
		('a', '20', '4'), ('b', '2', '0'), ('a', '30', '6.5'), ('a', '40', '1e1'),
		('missing', '1', '9'), ('missing', '2', NULL), ('missing', '3', '1'),
		('invalid', '1', '9'), ('invalid', '2', 'NaN'), ('invalid', '3', '1'),
		('ambiguous', '1', '9'), ('ambiguous', '01', '5'), ('ambiguous', '2', '0'),
		('b', '-1', '99'), ('b', '-1', '98'), (NULL, '10', '6'), (NULL, '10', '4');`
	const tripTimeOrder = `CREATE TABLE stop_times (trip_id TEXT, stop_sequence TEXT, arrival_time TEXT, departure_time TEXT);
		INSERT INTO stop_times VALUES ('a', '10', '25:00:00', '25:02:00'),
		('b', '2', '0:00:00', '0:00:00'), ('a', '2', '9:00:00', '10:00:00'),
		('a', '20', '24:59:59', '25:01:00'), ('a', '30', '024:59:59', '25:01:00'),
		('b', '10', '0:00:00', '0:00:00'), ('missing', '1', '20:00:00', '20:00:00'),
		('missing', '2', NULL, 'bad'), ('missing', '3', '10:00:00', '10:00:00'),
		('ambiguous', '1', '20:00:00', '20:00:00'), ('ambiguous', '01', '15:00:00', '15:00:00'),
		('ambiguous', '2', '10:00:00', '10:00:00'), ('b', 'bad', '99:00:00', '99:00:00'),
		('b', '-1', '99:00:00', '99:00:00'), (NULL, '1', '20:00:00', '20:00:00'),
		(NULL, '2', '10:00:00', '10:00:00');`
	const routeDescriptions = `CREATE TABLE routes (route_desc TEXT, route_long_name TEXT, route_short_name TEXT);
		INSERT INTO routes VALUES ('Bus', 'Bus', 'B'), ('X', 'Express', 'X'), ('Loop', 'Loop', 'Loop'),
		('bus', 'Bus', 'Bus'), ('Loop ', 'Loop', 'Loop'), (' ', ' ', ' '),
		(NULL, NULL, NULL), ('Spare', NULL, NULL);`
	for _, test := range []struct {
		name, rule, setup, file, field string
		severity                       types.Severities
		options                        []string
		rows                           [][]int
	}{
		{name: "required column", rule: "routes_route_id_exists", setup: "CREATE TABLE routes (extra TEXT)", file: "routes", field: "route_id", rows: [][]int{nil}},
		{name: "required value", rule: "routes_route_id_exists", setup: "CREATE TABLE routes (route_id TEXT); INSERT INTO routes VALUES ('r'), (NULL), (' ')", file: "routes", field: "route_id", rows: [][]int{{1, 2}}},
		{name: "optional field", rule: "routes_cemv_support_exists", setup: "CREATE TABLE routes (route_id TEXT)"},
		{name: "configured presence", rule: "routes_cemv_support_exists", setup: "CREATE TABLE routes (route_id TEXT)", file: "routes", field: "cemv_support", severity: types.SEVERITY_ERROR, rows: [][]int{nil}},
		{name: "forbidden field", rule: "routes_cemv_support_exists", setup: "CREATE TABLE routes (cemv_support TEXT); INSERT INTO routes VALUES ('1'), (NULL)", file: "routes", field: "cemv_support", severity: types.SEVERITY_FORBIDDEN, rows: [][]int{{0}}},
		{name: "single agency", rule: "fare_attributes_agency_id_exists", setup: "CREATE TABLE agency (agency_name TEXT); INSERT INTO agency VALUES ('A'); CREATE TABLE fare_attributes (fare_id TEXT)", severity: types.SEVERITY_ERROR},
		{name: "multiple agencies", rule: "fare_attributes_agency_id_exists", setup: "CREATE TABLE agency (agency_name TEXT); INSERT INTO agency VALUES ('A'), ('B'); CREATE TABLE fare_attributes (agency_id TEXT); INSERT INTO fare_attributes VALUES ('a'), (NULL)", file: "fare_attributes", field: "agency_id", rows: [][]int{{1}}},
		{name: "unlimited transfers", rule: "fare_attributes_transfers_exists", setup: "CREATE TABLE fare_attributes (transfers TEXT); INSERT INTO fare_attributes VALUES ('0'), (NULL)"},
		{name: "required transfers header", rule: "fare_attributes_transfers_exists", setup: "CREATE TABLE fare_attributes (fare_id TEXT)", file: "fare_attributes", field: "transfers", rows: [][]int{nil}},
		{name: "fare zone lookup", rule: "fare_rules_origin_id_foreign_key_exists", setup: "CREATE TABLE stops (zone_id TEXT); INSERT INTO stops VALUES ('01'); CREATE TABLE fare_rules (origin_id TEXT); INSERT INTO fare_rules VALUES ('01'), ('1'), (NULL)", file: "fare_rules", field: "origin_id", rows: [][]int{{1}}},
		{name: "missing target table", rule: "fare_rules_fare_id_foreign_key_exists", setup: "CREATE TABLE fare_rules (fare_id TEXT); INSERT INTO fare_rules VALUES ('a')", file: "fare_rules", field: "fare_id", rows: [][]int{{0}}},
		{name: "self reference", rule: "stops_parent_station_foreign_key_exists", setup: "CREATE TABLE stops (stop_id TEXT, parent_station TEXT); INSERT INTO stops VALUES ('p', NULL), ('a', 'p'), ('b', 'q')", file: "stops", field: "parent_station", rows: [][]int{{2}}},
		{name: "parent station forbidden for stations", rule: "stops_parent_station_forbidden", setup: stopLocationTypes, file: "stops", field: "parent_station", rows: [][]int{{1}, {9}}},
		{name: "parent station required by location type", rule: "stops_parent_station_required", setup: stopLocationTypes, file: "stops", field: "parent_station", rows: [][]int{{3}, {4}, {5}}},
		{name: "platform code forbidden for nonzero location types", rule: "stops_platform_code_forbidden", setup: stopLocationTypes, file: "stops", field: "platform_code", rows: [][]int{{1}, {3}, {4}, {5}, {9}, {14}}},
		{name: "required parent column missing", rule: "stops_parent_station_required", setup: "CREATE TABLE stops (location_type TEXT); INSERT INTO stops VALUES ('2'), ('0')", file: "stops", field: "parent_station", rows: [][]int{{0}}},
		{name: "platform code with location type column missing", rule: "stops_platform_code_forbidden", setup: "CREATE TABLE stops (platform_code TEXT); INSERT INTO stops VALUES ('A')"},
		{name: "stops table missing for location type restrictions", rule: "stops_parent_station_forbidden", setup: "CREATE TABLE trips (trip_id TEXT)"},
		{name: "stop code equals stop ID", rule: "stops_stop_code_equals_stop_id", setup: `CREATE TABLE stops (stop_id TEXT, stop_code TEXT);
			INSERT INTO stops VALUES ('001', '001'), ('001', '1'), ('A', 'a'), ('B', 'B '),
			(NULL, '1'), ('2', NULL), ('3', ' '), (' ', '4');`,
			file: "stops", field: "stop_code", rows: [][]int{{1}, {2}, {3}}},
		{name: "stop code column missing", rule: "stops_stop_code_equals_stop_id", setup: "CREATE TABLE stops (stop_id TEXT); INSERT INTO stops VALUES ('001')"},
		{name: "stops table missing for stop code comparison", rule: "stops_stop_code_equals_stop_id", setup: "CREATE TABLE trips (trip_id TEXT)"},
		{name: "standard zone", rule: "stops_zone_id_foreign_key_exists", setup: "CREATE TABLE stops (zone_id TEXT); INSERT INTO stops VALUES ('a')"},
		{name: "extension zone", rule: "stops_zone_id_foreign_key_exists", setup: "CREATE TABLE zones (zone_id TEXT); INSERT INTO zones VALUES ('a'); CREATE TABLE stops (zone_id TEXT); INSERT INTO stops VALUES ('a'), ('b')", file: "stops", field: "zone_id", rows: [][]int{{1}}},
		{name: "valid enum", rule: "routes_cemv_support_valid", setup: "CREATE TABLE routes (cemv_support TEXT); INSERT INTO routes VALUES ('0'), ('02'), ('3'), (NULL)", file: "routes", field: "cemv_support", rows: [][]int{{2}}},
		{name: "enum options", rule: "routes_cemv_support_valid", setup: "CREATE TABLE routes (cemv_support TEXT); INSERT INTO routes VALUES ('0'), ('02'), ('3'), (NULL)", file: "routes", field: "cemv_support", options: []string{"2"}, rows: [][]int{{0}, {2}}},
		{name: "all options", rule: "routes_cemv_support_valid", setup: "CREATE TABLE routes (cemv_support TEXT); INSERT INTO routes VALUES ('0'), ('02'), ('3'), (NULL)", file: "routes", field: "cemv_support", options: []string{"all_options"}, rows: [][]int{{2}}},
		{name: "empty options", rule: "routes_cemv_support_valid", setup: "CREATE TABLE routes (cemv_support TEXT); INSERT INTO routes VALUES ('0'), ('02'), ('3'), (NULL)", file: "routes", field: "cemv_support", options: []string{}, rows: [][]int{{0}, {1}, {2}}},
		{name: "date", rule: "calendar_start_date_valid", setup: "CREATE TABLE calendar (start_date TEXT); INSERT INTO calendar VALUES ('20240229'), ('20230229'), ('2024-02-29'), (NULL)", file: "calendar", field: "start_date", rows: [][]int{{1}, {2}}},
		{name: "calendar dates unique per service", rule: "calendar_dates_date_unique_per_service_id", setup: `CREATE TABLE calendar_dates (service_id TEXT, date TEXT, exception_type TEXT);
			INSERT INTO calendar_dates VALUES ('a', '20240229', '1'), ('b', '20240229', '1'),
			('a', ' 20240229 ', '2'), ('a', '20240301', '1'), ('a', '20240229', '1'),
			('a', '20240302', '1'), ('a', '20240302', '1'),
			(NULL, '20240229', '1'), (NULL, '20240229', '1'),
			(' ', '20240229', '1'), (' ', '20240229', '1'),
			('a', NULL, '1'), ('a', NULL, '1'),
			('a', '20240230', '1'), ('a', '20240230', '1');`,
			file: "calendar_dates", field: "date", rows: [][]int{{0, 2, 4}, {5, 6}}},
		{name: "calendar dates date column missing", rule: "calendar_dates_date_unique_per_service_id", setup: "CREATE TABLE calendar_dates (service_id TEXT); INSERT INTO calendar_dates VALUES ('a'), ('a')"},
		{name: "calendar dates table missing", rule: "calendar_dates_date_unique_per_service_id", setup: "CREATE TABLE calendar (service_id TEXT)"},
		{name: "calendar date order", rule: "calendar_start_date_before_end_date", setup: `CREATE TABLE calendar (start_date TEXT, end_date TEXT);
			INSERT INTO calendar VALUES ('20231231', '20240101'), ('20240229', '20240229'),
			('20240301', '20240229'), (NULL, '20240101'), ('20240401', ' '),
			('20240230', '20240229'), ('20240301', '2024-02-29'), (' 20250101 ', '20241231');`,
			file: "calendar", field: "start_date", rows: [][]int{{2}, {7}}},
		{name: "calendar end date column missing", rule: "calendar_start_date_before_end_date", setup: "CREATE TABLE calendar (start_date TEXT); INSERT INTO calendar VALUES ('20240301')"},
		{name: "calendar table missing", rule: "calendar_start_date_before_end_date", setup: "CREATE TABLE calendar_dates (date TEXT)"},
		{name: "feed info date order", rule: "feed_info_start_date_before_end_date", setup: `CREATE TABLE feed_info (feed_start_date TEXT, feed_end_date TEXT);
			INSERT INTO feed_info VALUES ('20231231', '20240101'), ('20240229', '20240229'),
			('20240301', '20240229'), (NULL, '20240101'), ('20240401', ' '),
			('20240230', '20240229'), ('20240301', '2024-02-29'), (' 20250101 ', '20241231');`,
			file: "feed_info", field: "feed_start_date", rows: [][]int{{2}, {7}}},
		{name: "feed info date column missing", rule: "feed_info_start_date_before_end_date", setup: "CREATE TABLE feed_info (feed_start_date TEXT); INSERT INTO feed_info VALUES ('20240301')"},
		{name: "feed info table missing", rule: "feed_info_start_date_before_end_date", setup: "CREATE TABLE calendar (start_date TEXT)"},
		{name: "time", rule: "stop_times_arrival_time_valid", setup: "CREATE TABLE stop_times (arrival_time TEXT); INSERT INTO stop_times VALUES ('7:01:02'), ('25:01:02'), ('25:60:00'), ('7:1:02'), (NULL)", file: "stop_times", field: "arrival_time", rows: [][]int{{2}, {3}}},
		{name: "arrival before departure at a stop", rule: "stop_times_arrival_time_before_departure_time", setup: `CREATE TABLE stop_times (arrival_time TEXT, departure_time TEXT);
			INSERT INTO stop_times VALUES ('9:59:59', '10:00:00'), ('9:00:00', '09:00:00'),
			(' 25:00:00 ', '24:59:59'), ('23:59:59', '24:00:00'), (NULL, '09:00:00'),
			('09:00:00', '08:60:00'), ('00:00:01', '0:00:00'),
			('999999999999999999999:59:59', '1000000000000000000000:00:00');`,
			file: "stop_times", field: "arrival_time", rows: [][]int{{2}, {6}}},
		{name: "arrival times increase by stop sequence", rule: "stop_times_increasing_arrival_time", setup: tripTimeOrder, file: "stop_times", field: "arrival_time", rows: [][]int{{0, 3}}},
		{name: "departure times increase by stop sequence", rule: "stop_times_increasing_departure_time", setup: tripTimeOrder, file: "stop_times", field: "departure_time", rows: [][]int{{0, 3}}},
		{name: "departure column missing for same stop", rule: "stop_times_arrival_time_before_departure_time", setup: "CREATE TABLE stop_times (arrival_time TEXT); INSERT INTO stop_times VALUES ('10:00:00')"},
		{name: "stop sequence column missing for time order", rule: "stop_times_increasing_arrival_time", setup: "CREATE TABLE stop_times (trip_id TEXT, arrival_time TEXT); INSERT INTO stop_times VALUES ('a', '10:00:00'), ('a', '9:00:00')"},
		{name: "stop times table missing for departure order", rule: "stop_times_increasing_departure_time", setup: "CREATE TABLE trips (trip_id TEXT)"},
		{name: "location group conflicts with other stop locations", rule: "stop_times_location_group_id_forbidden", setup: `CREATE TABLE stop_times (location_group_id TEXT, stop_id TEXT, location_id TEXT);
			INSERT INTO stop_times VALUES ('g', 's', NULL), ('g', NULL, 'l'), ('g', 's', 'l'),
			('g', NULL, NULL), (NULL, 's', 'l'), (' ', 's', 'l'), ('g', '', ' ');`,
			file: "stop_times", field: "location_group_id", severity: types.SEVERITY_FORBIDDEN, rows: [][]int{{0}, {1}, {2}}},
		{name: "location group alone with missing columns", rule: "stop_times_location_group_id_forbidden", setup: "CREATE TABLE stop_times (location_group_id TEXT); INSERT INTO stop_times VALUES ('g')"},
		{name: "location ID conflicts with other stop locations", rule: "stop_times_location_id_forbidden", setup: `CREATE TABLE stop_times (location_id TEXT, stop_id TEXT, location_group_id TEXT);
			INSERT INTO stop_times VALUES ('l', 's', NULL), ('l', NULL, 'g'), ('l', 's', 'g'),
			('l', NULL, NULL), (NULL, 's', 'g'), (' ', 's', 'g'), ('l', '', ' ');`,
			file: "stop_times", field: "location_id", severity: types.SEVERITY_FORBIDDEN, rows: [][]int{{0}, {1}, {2}}},
		{name: "location ID alone with missing columns", rule: "stop_times_location_id_forbidden", setup: "CREATE TABLE stop_times (location_id TEXT); INSERT INTO stop_times VALUES ('l')"},
		{name: "stop times missing for location ID restriction", rule: "stop_times_location_id_forbidden", setup: "CREATE TABLE trips (trip_id TEXT)"},
		{name: "stop times missing for location group restriction", rule: "stop_times_location_group_id_forbidden", setup: "CREATE TABLE trips (trip_id TEXT)"},
		{name: "stop sequence unique within each trip", rule: "stop_times_increasing_stop_sequence", setup: stopDistanceOrder, file: "stop_times", field: "stop_sequence", rows: [][]int{{13, 14}}},
		{name: "stop distance increases by numeric sequence", rule: "stop_times_increasing_shape_dist_traveled", setup: stopDistanceOrder, file: "stop_times", field: "shape_dist_traveled", rows: [][]int{{2, 0}, {0, 3}}},
		{name: "stop sequence column missing", rule: "stop_times_increasing_stop_sequence", setup: "CREATE TABLE stop_times (trip_id TEXT); INSERT INTO stop_times VALUES ('a'), ('a')"},
		{name: "stop distance column missing", rule: "stop_times_increasing_shape_dist_traveled", setup: "CREATE TABLE stop_times (trip_id TEXT, stop_sequence TEXT); INSERT INTO stop_times VALUES ('a', '1'), ('a', '2')"},
		{name: "stop times table missing for distance", rule: "stop_times_increasing_shape_dist_traveled", setup: "CREATE TABLE trips (trip_id TEXT)"},
		{name: "color", rule: "routes_route_color_valid", setup: "CREATE TABLE routes (route_color TEXT); INSERT INTO routes VALUES ('Ff000A'), ('#FF000A'), ('ZZ0000'), (NULL)", file: "routes", field: "route_color", rows: [][]int{{1}, {2}}},
		{name: "route color contrast", rule: "routes_route_color_route_text_color_contrast", setup: `CREATE TABLE routes (route_color TEXT, route_text_color TEXT);
			INSERT INTO routes VALUES ('ffffff', '000000'), ('000000', 'ffffff'),
			('FFFFFF', '767676'), ('FFFFFF', '777777'), ('112233', '112233'),
			('000000', 'FF0000'), ('FFFFFF', '00FF00'), ('0A0A0A', 'FFFFFF'),
			(NULL, '777777'), ('FFFFFF', ''), ('#FFFFFF', 'FFFFFF'),
			('FFFFFF', 'xyzxyz'), ('FFFFFF', 'FFF');`,
			file: "routes", field: "route_text_color", rows: [][]int{{3}, {4}, {6}}},
		{name: "route text color column missing", rule: "routes_route_color_route_text_color_contrast", setup: "CREATE TABLE routes (route_color TEXT); INSERT INTO routes VALUES ('FFFFFF')"},
		{name: "routes table missing for contrast", rule: "routes_route_color_route_text_color_contrast", setup: "CREATE TABLE trips (trip_id TEXT)"},
		{name: "description duplicates long name", rule: "routes_route_desc_different_from_route_long_name", setup: routeDescriptions, file: "routes", field: "route_desc", rows: [][]int{{0}, {2}}},
		{name: "description duplicates short name", rule: "routes_route_desc_different_from_route_short_name", setup: routeDescriptions, file: "routes", field: "route_desc", rows: [][]int{{1}, {2}}},
		{name: "route long name column missing", rule: "routes_route_desc_different_from_route_long_name", setup: "CREATE TABLE routes (route_desc TEXT); INSERT INTO routes VALUES ('Bus')"},
		{name: "routes table missing", rule: "routes_route_desc_different_from_route_short_name", setup: "CREATE TABLE trips (trip_id TEXT)"},
		{name: "route URL matches corresponding agency", rule: "routes_route_url_different_from_agency_url", setup: `CREATE TABLE agency (agency_id TEXT, agency_url TEXT);
			INSERT INTO agency VALUES ('a', 'https://a.example'), ('b', 'https://b.example'),
			('ambiguous', 'https://a.example'), ('ambiguous', 'https://b.example'), ('invalid', 'bad'),
			('empty', NULL), ('blank', ' ');
			CREATE TABLE routes (agency_id TEXT, route_url TEXT);
			INSERT INTO routes VALUES ('a', 'https://a.example'), ('a', 'https://b.example'),
			('b', 'https://b.example'), ('a', 'https://a.example/'), (NULL, 'https://a.example'),
			('unknown', 'https://a.example'), ('ambiguous', 'https://a.example'),
			('ambiguous', 'https://b.example'), ('invalid', 'bad'), ('a', NULL),
			('empty', NULL), ('blank', ' '), ('unknown', NULL);`,
			file: "routes", field: "route_url", rows: [][]int{{0}, {2}, {8}}},
		{name: "route URL matches sole agency", rule: "routes_route_url_different_from_agency_url", setup: `CREATE TABLE agency (agency_url TEXT);
			INSERT INTO agency VALUES ('https://a.example');
			CREATE TABLE routes (agency_id TEXT, route_url TEXT);
			INSERT INTO routes VALUES (NULL, 'https://a.example'), ('missing', 'https://a.example');`,
			file: "routes", field: "route_url", rows: [][]int{{0}}},
		{name: "agency URL column missing", rule: "routes_route_url_different_from_agency_url", setup: `CREATE TABLE agency (agency_id TEXT);
			INSERT INTO agency VALUES ('a');
			CREATE TABLE routes (route_url TEXT);
			INSERT INTO routes VALUES ('https://a.example');`},
		{name: "route URL without agency table", rule: "routes_route_url_different_from_agency_url", setup: "CREATE TABLE routes (route_url TEXT)"},
		{name: "price", rule: "fare_attributes_price_valid", setup: "CREATE TABLE fare_attributes (price TEXT); INSERT INTO fare_attributes VALUES ('0'), ('1.75'), ('-0.01'), ('NaN'), ('+Inf'), (NULL)", file: "fare_attributes", field: "price", rows: [][]int{{2}, {3}, {4}}},
		{name: "currency", rule: "fare_attributes_currency_type_valid", setup: "CREATE TABLE fare_attributes (currency_type TEXT); INSERT INTO fare_attributes VALUES ('EUR'), ('USD'), ('ZZZ'), ('€')", file: "fare_attributes", field: "currency_type", rows: [][]int{{2}, {3}}},
		{name: "coordinate bounds", rule: "shapes_shape_pt_lat_valid", setup: "CREATE TABLE shapes (shape_pt_lat TEXT); INSERT INTO shapes VALUES ('-90'), ('90'), ('90.01'), ('-90.1'), ('NaN')", file: "shapes", field: "shape_pt_lat", rows: [][]int{{2}, {3}, {4}}},
		{name: "shape sequence unique within each shape", rule: "shapes_shape_pt_sequence_strictly_increasing", setup: `CREATE TABLE shapes (shape_id TEXT, shape_pt_sequence TEXT);
			INSERT INTO shapes VALUES ('a', '10'), ('b', '10'), ('a', '2'), ('a', '010'),
			('b', '0'), ('a', ' 10 '), ('a', '-1'), ('a', '-1'), ('a', 'bad'), ('a', 'bad'),
			(NULL, '2'), (NULL, '2'), ('a', NULL), ('a', NULL);`,
			file: "shapes", field: "shape_pt_sequence", rows: [][]int{{0, 3, 5}}},
		{name: "shape distance increases by numeric sequence", rule: "shapes_shape_dist_traveled_strictly_increasing", setup: `CREATE TABLE shapes (shape_id TEXT, shape_pt_sequence TEXT, shape_dist_traveled TEXT);
			INSERT INTO shapes VALUES ('a', '10', '5'), ('b', '10', '6'), ('a', '2', '5.0'),
			('a', '20', '4'), ('b', '2', '0'), ('a', '30', '6.5'), ('a', '40', '1e1'),
			('missing', '1', '9'), ('missing', '2', NULL), ('missing', '3', '1'),
			('invalid', '1', '9'), ('invalid', '2', 'NaN'), ('invalid', '3', '1'),
			('ambiguous', '1', '9'), ('ambiguous', '01', '5'), ('ambiguous', '2', '0'),
			('b', '-1', '99'), (NULL, '10', '6'), (NULL, '20', '4');`,
			file: "shapes", field: "shape_dist_traveled", rows: [][]int{{2, 0}, {0, 3}}},
		{name: "shape distance column missing", rule: "shapes_shape_dist_traveled_strictly_increasing", setup: "CREATE TABLE shapes (shape_id TEXT, shape_pt_sequence TEXT); INSERT INTO shapes VALUES ('a', '1'), ('a', '2')"},
		{name: "shape sequence column missing", rule: "shapes_shape_pt_sequence_strictly_increasing", setup: "CREATE TABLE shapes (shape_id TEXT); INSERT INTO shapes VALUES ('a'), ('a')"},
		{name: "shapes table missing for sequence", rule: "shapes_shape_pt_sequence_strictly_increasing", setup: "CREATE TABLE trips (trip_id TEXT)"},
		{name: "shapes table missing for distance", rule: "shapes_shape_dist_traveled_strictly_increasing", setup: "CREATE TABLE trips (trip_id TEXT)"},
		{name: "required bicycle capacity", rule: "vehicles_vehicle_bicycle_capacity_exists", setup: "CREATE TABLE vehicles (bicycles_capacity TEXT); INSERT INTO vehicles VALUES ('0'), (NULL)", file: "vehicles", field: "bicycles_capacity", rows: [][]int{{1}}},
		{name: "integer bicycle capacity", rule: "vehicles_vehicle_bicycle_capacity_valid", setup: "CREATE TABLE vehicles (bicycles_capacity TEXT); INSERT INTO vehicles VALUES ('0'), ('5'), ('-1'), ('1.5'), ('1e1'), (NULL)", file: "vehicles", field: "bicycles_capacity", rows: [][]int{{2}, {3}, {4}}},
		{name: "vehicle emissions", rule: "vehicles_vehicle_emission_valid", setup: "CREATE TABLE vehicles (emission TEXT); INSERT INTO vehicles VALUES ('Euro VI'), ('N/A'), ('8'), ('Euro VIII')", file: "vehicles", field: "emission", rows: [][]int{{2}, {3}}},
		{name: "pattern distances", rule: "pattern_same_stop_dist_traveled", setup: `CREATE TABLE trips (trip_id TEXT, route_id TEXT, direction_id TEXT);
			INSERT INTO trips VALUES ('a', 'r', '0'), ('b', 'r', '0');
			CREATE TABLE stop_times (trip_id TEXT, stop_sequence TEXT, shape_dist_traveled TEXT);
			INSERT INTO stop_times VALUES ('a', '1', '0'), ('a', '2', '10'), ('b', '1', '0'), ('b', '2', '11');`,
			file: "stop_times", field: "shape_dist_traveled", rows: [][]int{{0, 1, 2, 3}}},
		{name: "content placeholder", rule: "stops_name_matches_database", setup: "CREATE TABLE stops (stop_name TEXT); INSERT INTO stops VALUES ('A')"},
	} {
		t.Run(test.name, func(t *testing.T) {
			severity := test.severity
			if severity == "" {
				severity = types.SEVERITY_WARNING
			}
			graph, err := rules.NewValidationGraph([]types.Rule{{RuleID: test.rule, Severity: severity, Options: test.options}})
			if err != nil {
				t.Fatal(err)
			}
			results, err := graph.Execute(t.Context(), openSQLTestDatabase(t, test.setup), 1)
			if err != nil {
				t.Fatal(err)
			}
			result := results[0]
			wantStatus := types.Passed
			if len(test.rows) > 0 {
				wantStatus = types.Failed
			}
			var gotRows [][]int
			for _, finding := range result.Value {
				if finding.FileName != test.file+".txt" || finding.Field != test.field || finding.Severity != severity {
					t.Errorf("unexpected finding: %+v", finding)
				}
				gotRows = append(gotRows, finding.Rows)
			}
			if result.Status != wantStatus || !reflect.DeepEqual(gotRows, test.rows) {
				t.Fatalf("got %s with rows %v, want %s with rows %v", result.Status, gotRows, wantStatus, test.rows)
			}
		})
	}
}

func TestRequestedFileRulesThroughGraph(t *testing.T) {
	for _, table := range strings.Fields("calendar calendar_dates fare_attributes fare_rules feed_info routes shapes stops vehicles") {
		t.Run(table, func(t *testing.T) {
			for _, test := range []struct {
				severity types.Severities
				present  bool
				status   types.Status
				findings int
			}{
				{types.SEVERITY_ERROR, true, types.Passed, 0},
				{types.SEVERITY_ERROR, false, types.Failed, 1},
				{types.SEVERITY_IGNORE, true, types.Passed, 0},
				{types.SEVERITY_IGNORE, false, types.Failed, 0},
				{types.SEVERITY_FORBIDDEN, true, types.Failed, 1},
				{types.SEVERITY_FORBIDDEN, false, types.Passed, 0},
			} {
				t.Run(fmt.Sprintf("%s/present=%t", test.severity, test.present), func(t *testing.T) {
					graph, err := rules.NewValidationGraph([]types.Rule{{RuleID: table + "_file_exists", Severity: test.severity}})
					if err != nil {
						t.Fatal(err)
					}
					setup := "CREATE TABLE agency (agency_id TEXT)"
					if test.present {
						setup = fmt.Sprintf("CREATE TABLE %s (extra TEXT)", table)
					}
					results, err := graph.Execute(t.Context(), openSQLTestDatabase(t, setup), 1)
					if err != nil {
						t.Fatal(err)
					}
					result := results[0]
					if result.Status != test.status || len(result.Value) != test.findings {
						t.Fatalf("unexpected result: %+v", result)
					}
					for _, finding := range result.Value {
						if finding.FileName != table+".txt" || finding.Severity != test.severity || len(finding.Rows) != 0 {
							t.Errorf("unexpected finding: %+v", finding)
						}
					}
				})
			}
		})
	}
}

func TestRequestedRulesWithFeedArchive(t *testing.T) {
	path := filepath.Join(t.TempDir(), "feed.zip")
	files := map[string]string{
		"vehicles.txt": "vehicle_id,bicycles_capacity\nv1,0\nv2,-1\n",
		"zones.txt":    "zone_id\nz1\n",
		"stops.txt":    "stop_id,zone_id\ns1,z1\ns2,z2\n",
	}
	if err := os.WriteFile(path, archive(t, files), 0600); err != nil {
		t.Fatal(err)
	}

	const capacityRule = "vehicles_vehicle_bicycle_capacity_valid"
	const zoneRule = "stops_zone_id_foreign_key_exists"
	configs := []types.Rule{
		{RuleID: "vehicles_file_exists", Severity: types.SEVERITY_IGNORE},
		{RuleID: capacityRule, Severity: types.SEVERITY_ERROR, DependsOn: []string{"vehicles_file_exists"}},
		{RuleID: zoneRule, Severity: types.SEVERITY_ERROR},
	}
	report, err := validator.GtfsValidator(t.Context(), validator.Options{
		Source: importgtfs.ImportGtfsConfigSource{Path: path}, Rules: configs,
	})
	if err != nil {
		t.Fatal(err)
	}

	want := map[string]string{capacityRule: "bicycles_capacity", zoneRule: "zone_id"}
	if report.TotalErrors != len(want) || len(report.Messages) != len(want) {
		t.Fatalf("unexpected report: %+v", report)
	}
	for _, finding := range report.Messages {
		if field := want[finding.RuleID]; field == "" || field != finding.Field {
			t.Fatalf("unexpected finding: %+v", finding)
		}
		delete(want, finding.RuleID)
	}
}
