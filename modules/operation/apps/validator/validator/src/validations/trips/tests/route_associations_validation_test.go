package trips

import (
	"main/i18n"
	"main/lib"
	"main/lib/rules"
	"main/services"
	"main/types"
	validations "main/validations/trips/validations"
	"strings"
	"testing"
)

func TestRouteAssociations(t *testing.T) {
	trip := func(value string, direction int, row int) types.Trip {
		return types.Trip{ShapeId: lib.Ptr(value), TripHeadsign: lib.Ptr(value), DirectionId: lib.Ptr(direction), Row: row}
	}
	checks := []struct {
		id, field string
		direction bool
		configure func(*types.TripsRules, types.Severity)
		run       func(types.TripGroupedByRouteId, *types.Gtfs, *types.TripsRules, string)
	}{
		{"trips_shape_id_max_two_per_route", "shape_id", false, func(r *types.TripsRules, s types.Severity) { r.ShapeIdMaxTwoPerRoute.Severity = s }, validations.ShapeIdRouteGroupRuleValidation},
		{"trip_headsign_max_two_per_route", "trip_headsign", false, func(r *types.TripsRules, s types.Severity) { r.TripHeadsignMaxTwoPerRoute.Severity = s }, validations.TripHeadsignRouteGroupRuleValidation},
		{"trips_shape_id_consistent_per_route_direction", "shape_id", true, func(r *types.TripsRules, s types.Severity) { r.ShapeIdConsistentPerRouteDirection.Severity = s }, validations.ShapeIdRouteGroupRuleValidation},
		{"trip_headsign_consistent_per_route_direction", "trip_headsign", true, func(r *types.TripsRules, s types.Severity) { r.TripHeadsignConsistentPerRouteDirection.Severity = s }, validations.TripHeadsignRouteGroupRuleValidation},
	}
	cases := []struct {
		name                       string
		trips                      []types.Trip
		maxIssues, directionIssues int
	}{
		{"empty", nil, 0, 0},
		{"one value", []types.Trip{trip("A", 0, 10)}, 0, 0},
		{"two directions", []types.Trip{trip("A", 0, 10), trip("B", 1, 20)}, 0, 0},
		{"repeated trips", []types.Trip{trip("A", 0, 10), trip("A", 0, 11), trip("B", 1, 20), trip("B", 1, 21)}, 0, 0},
		{"three distinct values", []types.Trip{trip("C", 0, 10), trip("A", 0, 11), trip("B", 1, 20)}, 1, 1},
		{"two values same direction", []types.Trip{trip("B", 0, 10), trip("A", 0, 11)}, 0, 1},
		{"same value both directions", []types.Trip{trip("A", 0, 10), trip("A", 1, 20)}, 0, 0},
		{"both directions inconsistent", []types.Trip{trip("A", 0, 10), trip("B", 0, 11), trip("A", 1, 20), trip("B", 1, 21)}, 0, 2},
		{"missing fields", []types.Trip{{}, trip("", 0, 9), trip("A", 0, 10)}, 0, 0},
		{"invalid directions", []types.Trip{trip("A", 2, 10), trip("B", 2, 11), trip("C", 2, 12)}, 1, 0},
		{"missing directions", []types.Trip{{ShapeId: lib.Ptr("A"), TripHeadsign: lib.Ptr("A")}, {ShapeId: lib.Ptr("B"), TripHeadsign: lib.Ptr("B")}}, 0, 0},
	}
	rules.ConfigureMessageSeverities(nil)
	t.Cleanup(services.AppMessageService.Clear)
	for _, check := range checks {
		for _, tc := range cases {
			for _, severity := range []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_IGNORE} {
				t.Run(check.id+"/"+tc.name+"/"+string(severity), func(t *testing.T) {
					services.AppMessageService.Clear()
					config := &types.TripsRules{}
					check.configure(config, severity)
					groups := types.TripGroupedByRouteId{
						"R1": {Trips: tc.trips},
						"R2": {Trips: []types.Trip{trip("X", 0, 30), trip("Y", 1, 31)}},
					}
					check.run(groups, nil, config, check.id)
					want := tc.maxIssues
					if check.direction {
						want = tc.directionIssues
					}
					if severity == types.SEVERITY_IGNORE {
						want = 0
					}
					messages := services.AppMessageService.GetSummary().Messages
					if len(messages) != want {
						t.Fatalf("got %+v, want %d issues", messages, want)
					}
					for _, message := range messages {
						if message.RuleID != check.id || message.Field != check.field || message.FileName != "trips.txt" || message.Severity != severity {
							t.Fatalf("incorrect rule metadata: %+v", message)
						}
						if !strings.Contains(message.Message, `"R1"`) || strings.Contains(message.Message, "route_associations_validation.") || strings.Contains(message.Message, "%!") {
							t.Fatalf("incorrect translated message: %+v", message)
						}
						if len(message.Rows) != 1 || (message.Rows[0] != 12 && message.Rows[0] != 22) {
							t.Fatalf("incorrect source row: %+v", message)
						}
					}
				})
			}
		}
	}
}

func TestRouteAssociationTranslations(t *testing.T) {
	for _, lang := range []string{"pt", "en"} {
		translator := i18n.NewTranslator(lang)
		for key, args := range map[string][]any{
			"route_associations_validation.max_two":                {"R1", "shape_id", 3, "A, B, C"},
			"route_associations_validation.inconsistent_direction": {"R1", 0, "trip_headsign", "A, B"},
		} {
			message := translator.Get(key, args...)
			if message == key || strings.Contains(message, "%!") {
				t.Fatalf("%s: %s", lang, message)
			}
		}
	}
}
