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
		{name: "standard zone", rule: "stops_zone_id_foreign_key_exists", setup: "CREATE TABLE stops (zone_id TEXT); INSERT INTO stops VALUES ('a')"},
		{name: "extension zone", rule: "stops_zone_id_foreign_key_exists", setup: "CREATE TABLE zones (zone_id TEXT); INSERT INTO zones VALUES ('a'); CREATE TABLE stops (zone_id TEXT); INSERT INTO stops VALUES ('a'), ('b')", file: "stops", field: "zone_id", rows: [][]int{{1}}},
		{name: "valid enum", rule: "routes_cemv_support_valid", setup: "CREATE TABLE routes (cemv_support TEXT); INSERT INTO routes VALUES ('0'), ('02'), ('3'), (NULL)", file: "routes", field: "cemv_support", rows: [][]int{{2}}},
		{name: "enum options", rule: "routes_cemv_support_valid", setup: "CREATE TABLE routes (cemv_support TEXT); INSERT INTO routes VALUES ('0'), ('02'), ('3'), (NULL)", file: "routes", field: "cemv_support", options: []string{"2"}, rows: [][]int{{0}, {2}}},
		{name: "all options", rule: "routes_cemv_support_valid", setup: "CREATE TABLE routes (cemv_support TEXT); INSERT INTO routes VALUES ('0'), ('02'), ('3'), (NULL)", file: "routes", field: "cemv_support", options: []string{"all_options"}, rows: [][]int{{2}}},
		{name: "empty options", rule: "routes_cemv_support_valid", setup: "CREATE TABLE routes (cemv_support TEXT); INSERT INTO routes VALUES ('0'), ('02'), ('3'), (NULL)", file: "routes", field: "cemv_support", options: []string{}, rows: [][]int{{0}, {1}, {2}}},
		{name: "date", rule: "calendar_start_date_valid", setup: "CREATE TABLE calendar (start_date TEXT); INSERT INTO calendar VALUES ('20240229'), ('20230229'), ('2024-02-29'), (NULL)", file: "calendar", field: "start_date", rows: [][]int{{1}, {2}}},
		{name: "calendar date order", rule: "calendar_start_date_before_end_date", setup: `CREATE TABLE calendar (start_date TEXT, end_date TEXT);
			INSERT INTO calendar VALUES ('20231231', '20240101'), ('20240229', '20240229'),
			('20240301', '20240229'), (NULL, '20240101'), ('20240401', ' '),
			('20240230', '20240229'), ('20240301', '2024-02-29'), (' 20250101 ', '20241231');`,
			file: "calendar", field: "start_date", rows: [][]int{{2}, {7}}},
		{name: "calendar end date column missing", rule: "calendar_start_date_before_end_date", setup: "CREATE TABLE calendar (start_date TEXT); INSERT INTO calendar VALUES ('20240301')"},
		{name: "calendar table missing", rule: "calendar_start_date_before_end_date", setup: "CREATE TABLE calendar_dates (date TEXT)"},
		{name: "time", rule: "stop_times_arrival_time_valid", setup: "CREATE TABLE stop_times (arrival_time TEXT); INSERT INTO stop_times VALUES ('7:01:02'), ('25:01:02'), ('25:60:00'), ('7:1:02'), (NULL)", file: "stop_times", field: "arrival_time", rows: [][]int{{2}, {3}}},
		{name: "color", rule: "routes_route_color_valid", setup: "CREATE TABLE routes (route_color TEXT); INSERT INTO routes VALUES ('Ff000A'), ('#FF000A'), ('ZZ0000'), (NULL)", file: "routes", field: "route_color", rows: [][]int{{1}, {2}}},
		{name: "price", rule: "fare_attributes_price_valid", setup: "CREATE TABLE fare_attributes (price TEXT); INSERT INTO fare_attributes VALUES ('0'), ('1.75'), ('-0.01'), ('NaN'), ('+Inf'), (NULL)", file: "fare_attributes", field: "price", rows: [][]int{{2}, {3}, {4}}},
		{name: "currency", rule: "fare_attributes_currency_type_valid", setup: "CREATE TABLE fare_attributes (currency_type TEXT); INSERT INTO fare_attributes VALUES ('EUR'), ('USD'), ('ZZZ'), ('€')", file: "fare_attributes", field: "currency_type", rows: [][]int{{2}, {3}}},
		{name: "coordinate bounds", rule: "shapes_shape_pt_lat_valid", setup: "CREATE TABLE shapes (shape_pt_lat TEXT); INSERT INTO shapes VALUES ('-90'), ('90'), ('90.01'), ('-90.1'), ('NaN')", file: "shapes", field: "shape_pt_lat", rows: [][]int{{2}, {3}, {4}}},
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
