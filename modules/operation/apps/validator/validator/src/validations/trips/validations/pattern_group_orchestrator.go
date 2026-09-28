package trips

import (
	ruleset "main/lib/rules"
	"main/services"
	"main/types"
)

// ValidatePatternGroups coordinates the checks that compare the trips of one
// pattern_id against each other, and the ones that compare the trips of one
// shape_id. Each action drives a single rule, so the rule runner can order the
// checks by their configured dependencies and give each one its own outcome,
// seeded with the rows of the group it is about.
//
// Both groupings live here because a broken pattern_id/shape_id pairing shows up
// on both sides: one pattern_id spread over several shape_id is the same fault as
// one shape_id claimed by several pattern_id. Running them from one place, with a
// shared reportedPairs map and the pattern_id side first, is what makes the fault
// reported once on the pattern_id rather than twice.
func ValidatePatternGroups(
	tripsGroupedByPattern types.TripGroupedByPattern,
	tripsGroupedByShapeId types.TripGroupedByShapeId,
	gtfs *types.Gtfs,
	rules *types.TripsRules,
	runner *services.RuleRunner,
	groupStatuses map[string]map[string]ruleset.Status,
) {
	// Shared by both loops: what the pattern_id side reported, so the shape_id
	// side can stay quiet about it. Only useful because the loops run in order.
	reportedPairs := make(map[string]bool)

	// 1. Validate the trips sharing a pattern_id agree on the fields that define it
	for patternId, group := range tripsGroupedByPattern {
		patterns := types.TripGroupedByPattern{patternId: group}
		runner.Run(services.RuleActions{
			"trips_pattern_id_trip_has_required_fields_for_grouping": func() {
				PatternIdGroupRuleValidation(patterns, gtfs, rules, "trips_pattern_id_trip_has_required_fields_for_grouping")
			},
			"trips_pattern_id_single_trip_signature_per_pattern": func() {
				PatternIdGroupRuleValidation(patterns, gtfs, rules, "trips_pattern_id_single_trip_signature_per_pattern")
			},
			"trips_route_id_consistent_for_all_patterns_in_trips": func() {
				RouteIdGroupValidation(patterns, gtfs, rules)
			},
			"trips_direction_id_consistent_for_all_patterns_in_trips": func() {
				DirectionIdGroupValidation(patterns, gtfs, rules)
			},
			"trips_one_shape_id_per_pattern_id_group": func() {
				ShapeIdGroupRuleValidation(patterns, nil, gtfs, rules, "trips_one_shape_id_per_pattern_id_group", reportedPairs)
			},
			"trip_headsign_consistent_for_all_patterns_in_trips": func() {
				TripHeadsignGroupValidation(patterns, gtfs, rules)
			},
		}, groupStatuses["pattern/"+patternId])
	}

	// 2. Validate each shape_id is claimed by a single pattern_id, staying quiet
	// about the pairings step 1 already reported
	for shapeId, group := range tripsGroupedByShapeId {
		shapes := types.TripGroupedByShapeId{shapeId: group}
		runner.Run(services.RuleActions{
			"trips_one_pattern_id_per_shape_id_group": func() {
				ShapeIdGroupRuleValidation(nil, shapes, gtfs, rules, "trips_one_pattern_id_per_shape_id_group", reportedPairs)
			},
		}, groupStatuses["shape/"+shapeId])
	}
}
