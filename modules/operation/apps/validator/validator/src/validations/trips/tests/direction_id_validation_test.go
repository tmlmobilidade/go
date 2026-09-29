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

	// Missing direction_id is reported at the configured severity; ignore,
	// forbidden and unset stay silent.
	for _, tc := range []struct {
		severity         types.Severity
		expectedErrors   int
		expectedWarnings int
	}{
		{types.SEVERITY_ERROR, 1, 0},
		{types.SEVERITY_WARNING, 0, 1},
		{types.SEVERITY_IGNORE, 0, 0},
		{types.SEVERITY_FORBIDDEN, 0, 0},
		{"", 0, 0},
	} {
		t.Run("Required_Missing_"+string(tc.severity), func(t *testing.T) {
			services.AppMessageService.Clear()
			trip := &types.Trip{DirectionId: nil}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"routes": {"MY_ROUTE_ID": []int{1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			var rules *types.TripsRules
			if tc.severity != "" {
				rules = &types.TripsRules{DirectionId: types.RuleConfig{Severity: tc.severity}}
			}
			validations.DirectionIdValidation(trip, 1, gtfs, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.expectedErrors, "Required_Missing", types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.expectedWarnings, "Required_Missing", types.SEVERITY_WARNING)
		})
	}
}
