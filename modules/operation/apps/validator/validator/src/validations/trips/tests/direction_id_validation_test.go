package trips

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/trips/validations"
	"testing"
)

func TestAllDirectionIdValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetBinaryValidOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("direction_id", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var directionId *int
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok {
					directionId = ptr
				}
			}

			trip := &types.Trip{DirectionId: directionId}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"routes": {"MY_ROUTE_ID": []int{1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			validations.DirectionIdValidation(trip, tc.Row, gtfs, &types.TripsRules{DirectionId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}

	// direction_id is unconditionally required: missing it is always an error,
	// regardless of what severity is configured for the rule.
	for _, severity := range []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_IGNORE, types.SEVERITY_FORBIDDEN, ""} {
		t.Run("Required_Missing_"+string(severity), func(t *testing.T) {
			services.AppMessageService.Clear()
			trip := &types.Trip{DirectionId: nil}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"routes": {"MY_ROUTE_ID": []int{1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			var rules *types.TripsRules
			if severity != "" {
				rules = &types.TripsRules{DirectionId: types.RuleConfig{Severity: severity}}
			}
			validations.DirectionIdValidation(trip, 1, gtfs, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Required_Missing", types.SEVERITY_ERROR)
		})
	}
}
