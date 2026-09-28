package trips

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/trips/validations"
	"testing"
)

// P1 spreads over S1 and S2, and S1 is shared with P2. That is one broken
// pairing, visible from the pattern_id side and from the shape_id side.
func brokenPairing() (types.TripGroupedByPattern, types.TripGroupedByShapeId) {
	t1 := types.Trip{PatternId: lib.Ptr("P1"), ShapeId: lib.Ptr("S1"), Row: 1}
	t2 := types.Trip{PatternId: lib.Ptr("P1"), ShapeId: lib.Ptr("S2"), Row: 2}
	t3 := types.Trip{PatternId: lib.Ptr("P2"), ShapeId: lib.Ptr("S1"), Row: 3}

	patterns := types.TripGroupedByPattern{
		"P1": {Trips: []types.Trip{t1, t2}},
		"P2": {Trips: []types.Trip{t3}},
	}
	shapes := types.TripGroupedByShapeId{
		"S1": {Trips: []types.Trip{t1, t3}},
		"S2": {Trips: []types.Trip{t2}},
	}
	return patterns, shapes
}

// The orchestrator drives one rule per call and shares reportedPairs between
// them, so the pairing is reported on the pattern_id and not again on the shape_id.
func TestShapeIdGroupRuleValidationReportsPairingOnce(t *testing.T) {
	services.AppMessageService.Clear()
	patterns, shapes := brokenPairing()
	rules := &types.TripsRules{
		OneShapeIdPerPatternIdGroup: types.RuleConfig{Severity: types.SEVERITY_ERROR},
		OnePatternIdPerShapeIdGroup: types.RuleConfig{Severity: types.SEVERITY_ERROR},
	}
	reportedPairs := make(map[string]bool)

	for patternId, group := range patterns {
		single := types.TripGroupedByPattern{patternId: group}
		validations.ShapeIdGroupRuleValidation(single, nil, nil, rules, "trips_one_shape_id_per_pattern_id_group", reportedPairs)
	}
	for shapeId, group := range shapes {
		single := types.TripGroupedByShapeId{shapeId: group}
		validations.ShapeIdGroupRuleValidation(nil, single, nil, rules, "trips_one_pattern_id_per_shape_id_group", reportedPairs)
	}

	test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "ReportsPairingOnce", types.SEVERITY_ERROR)
}

// Without the shared map each call starts blank, so the same pairing is reported
// from both sides. This is the behaviour the orchestrator must not fall back into.
func TestShapeIdGroupRuleValidationWithoutSharedStateReportsTwice(t *testing.T) {
	services.AppMessageService.Clear()
	patterns, shapes := brokenPairing()
	rules := &types.TripsRules{
		OneShapeIdPerPatternIdGroup: types.RuleConfig{Severity: types.SEVERITY_ERROR},
		OnePatternIdPerShapeIdGroup: types.RuleConfig{Severity: types.SEVERITY_ERROR},
	}

	for patternId, group := range patterns {
		single := types.TripGroupedByPattern{patternId: group}
		validations.ShapeIdGroupRuleValidation(single, nil, nil, rules, "trips_one_shape_id_per_pattern_id_group", nil)
	}
	for shapeId, group := range shapes {
		single := types.TripGroupedByShapeId{shapeId: group}
		validations.ShapeIdGroupRuleValidation(nil, single, nil, rules, "trips_one_pattern_id_per_shape_id_group", nil)
	}

	test_helpers.AssertMessageCount(t, services.AppMessageService, 2, "WithoutSharedState", types.SEVERITY_ERROR)
}

// An ignored pattern_id rule reports nothing, so it suppresses nothing: the
// shape_id side must still speak up.
func TestShapeIdGroupRuleValidationIgnoredPatternRuleSuppressesNothing(t *testing.T) {
	services.AppMessageService.Clear()
	patterns, shapes := brokenPairing()
	rules := &types.TripsRules{
		OneShapeIdPerPatternIdGroup: types.RuleConfig{Severity: types.SEVERITY_IGNORE},
		OnePatternIdPerShapeIdGroup: types.RuleConfig{Severity: types.SEVERITY_ERROR},
	}
	reportedPairs := make(map[string]bool)

	for patternId, group := range patterns {
		single := types.TripGroupedByPattern{patternId: group}
		validations.ShapeIdGroupRuleValidation(single, nil, nil, rules, "trips_one_shape_id_per_pattern_id_group", reportedPairs)
	}
	for shapeId, group := range shapes {
		single := types.TripGroupedByShapeId{shapeId: group}
		validations.ShapeIdGroupRuleValidation(nil, single, nil, rules, "trips_one_pattern_id_per_shape_id_group", reportedPairs)
	}

	test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "IgnoredPatternRule", types.SEVERITY_ERROR)
}

// The single-call wrapper keeps working: both rules, one shared map, one message.
func TestShapeIdGroupValidationWrapperReportsPairingOnce(t *testing.T) {
	services.AppMessageService.Clear()
	patterns, shapes := brokenPairing()
	rules := &types.TripsRules{
		OneShapeIdPerPatternIdGroup: types.RuleConfig{Severity: types.SEVERITY_ERROR},
		OnePatternIdPerShapeIdGroup: types.RuleConfig{Severity: types.SEVERITY_ERROR},
	}

	validations.ShapeIdGroupValidation(patterns, shapes, nil, rules)

	test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "WrapperReportsPairingOnce", types.SEVERITY_ERROR)
}
