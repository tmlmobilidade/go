package standard_test

import (
	"strings"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
)

func TestStandardUniqueIdentifiers(t *testing.T) {
	for _, check := range migratedChecks {
		if !strings.HasSuffix(check.id, "_unique") {
			continue
		}
		t.Run(check.id, func(t *testing.T) {
			db := fixture(t, check.table, []string{check.field}, []int{2, 5, 8, 11, 14, 17, 20}, [][]any{{"shared"}, {"only-once"}, {"shared"}, {""}, {nil}, {""}, {nil}})
			ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_WARNING})
			assertRows(t, check, ctx, findings, rules.SEVERITY_WARNING, 1, 7)
		})
	}
}

func TestStandardForeignIdentifiers(t *testing.T) {
	for _, tc := range []struct{ id, lookup, column string }{
		{"fare_attributes_agency_id_foreign", "agency", "agency_id"},
		{"fare_rules_fare_id_foreign", "fare_attributes", "fare_id"},
		{"fare_rules_route_id_foreign", "routes", "route_id"},
		{"frequencies_trip_id_foreign", "trips", "trip_id"},
		{"pathways_from_stop_id_foreign", "stops", "stop_id"},
		{"pathways_to_stop_id_foreign", "stops", "stop_id"},
		{"routes_agency_id_foreign", "agency", "agency_id"},
		{"routes_network_id_foreign", "route_networks", "network_id"},
		{"stop_times_drop_off_booking_rule_id_foreign", "booking_rules", "booking_rule_id"},
		{"stop_times_pickup_booking_rule_id_foreign", "booking_rules", "booking_rule_id"},
		{"stop_times_stop_id_foreign", "stops", "stop_id"},
		{"stop_times_trip_id_foreign", "trips", "trip_id"},
		{"stops_level_id_foreign", "levels", "level_id"},
		{"trips_route_id_foreign", "routes", "route_id"},
		{"vehicles_agency_id_foreign", "agency", "agency_id"},
	} {
		t.Run(tc.id, func(t *testing.T) {
			check := namedCheck(t, tc.id)
			db := fixture(t, check.table, []string{check.field}, []int{2, 5, 8, 11, 14}, [][]any{{"known"}, {"unknown"}, {"' OR 1=1 --"}, {""}, {nil}})
			addTable(t, db, tc.lookup, []string{tc.column}, []int{3, 7}, [][]any{{"known"}, {"known"}})
			ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
			assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR, 4, 7)
			if _, err := db.Exec(`DROP TABLE "` + tc.lookup + `"`); err != nil {
				t.Fatal(err)
			}
			ctx, findings = runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
			if !ctx.Skipped || ctx.Failed || len(findings) != 0 {
				t.Fatalf("absent lookup must skip: %+v %+v", ctx, findings)
			}
		})
	}
}

func TestParentStationReferencesAllowSeveralChildren(t *testing.T) {
	check := namedCheck(t, "stops_parent_station_foreign")
	db := fixture(t, "stops", []string{"stop_id", "parent_station"}, []int{2, 5, 8, 11, 14, 17}, [][]any{
		{"station", ""}, {"child-a", "station"}, {"child-b", "station"}, {"child-c", "unknown"}, {"child-d", "' OR 1=1 --"}, {"child-e", nil},
	})
	ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
	assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR, 10, 13)
}

func TestTransferTripRouteAgreement(t *testing.T) {
	for _, id := range []string{"transfers_from_trip_id_foreign", "transfers_to_trip_id_foreign"} {
		t.Run(id, func(t *testing.T) {
			check := namedCheck(t, id)
			routeColumn := strings.Replace(check.field, "trip_id", "route_id", 1)
			db := fixture(t, "transfers", []string{check.field, routeColumn}, []int{2, 5, 8, 11, 14}, [][]any{
				{"trip", "route"}, {"trip", "other"}, {"unknown", "route"}, {"trip", ""}, {"", "route"},
			})
			addTable(t, db, "trips", []string{"trip_id", "route_id"}, []int{3}, [][]any{{"trip", "route"}})
			ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
			assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR, 4, 7)
		})
	}
}

func TestTripsServiceMayComeFromEitherCalendar(t *testing.T) {
	check := namedCheck(t, "trips_service_id_foreign")
	for _, tables := range [][]string{{"calendar"}, {"calendar_dates"}, {"calendar", "calendar_dates"}} {
		t.Run(strings.Join(tables, "+"), func(t *testing.T) {
			db := fixture(t, "trips", []string{"service_id"}, []int{2, 5, 8, 11}, [][]any{{"known"}, {"unknown"}, {""}, {nil}})
			for _, table := range tables {
				addTable(t, db, table, []string{"service_id"}, []int{2}, [][]any{{"known"}})
			}
			ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
			assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR, 4)
		})
	}
	db := fixture(t, "trips", []string{"service_id"}, []int{2}, [][]any{{"known"}})
	ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
	if !ctx.Skipped || ctx.Failed || len(findings) != 0 {
		t.Fatalf("no calendar must skip: %+v", ctx)
	}
}
