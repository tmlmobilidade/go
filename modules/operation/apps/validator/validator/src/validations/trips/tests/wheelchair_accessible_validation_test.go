package trips

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/trips/validations"
	"testing"
)

func TestAllWheelchairAccessibleValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetThreeStateValidOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("wheelchair_accessible", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var wheelchairAccessible *int
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok {
					wheelchairAccessible = ptr
				}
			}

			trip := &types.Trip{WheelchairAccessible: wheelchairAccessible}
			gtfs := &types.Gtfs{}
			validations.WheelchairAccessibleValidation(trip, tc.Row, gtfs, &types.TripsRules{WheelchairAccessible: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
			expectedTotalMessages := tc.ExpectedErrors + tc.ExpectedWarnings
			test_helpers.AssertMessageCount(t, services.AppMessageService, expectedTotalMessages, tc.Name, types.SEVERITY_ERROR)
		})
	}

	for _, tc := range test_helpers.GetGenericSeverityTestCases("wheelchair_accessible") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			trip := &types.Trip{WheelchairAccessible: nil}
			gtfs := &types.Gtfs{}
			validations.WheelchairAccessibleValidation(trip, tc.Row, gtfs, &types.TripsRules{WheelchairAccessible: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
