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
		if value, ok := tc.Value.(*int); ok && value == nil {
			tc.Name = "Missing_Value_Optional"
			tc.ExpectedErrors = 0
		}
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
			trip := validations.ParseTrips(types.TripRaw{
				TripId:               "T1",
				RouteId:              "R1",
				ServiceId:            "S1",
				WheelchairAccessible: "",
			}, tc.Row)
			if trip.WheelchairAccessible != nil {
				t.Fatal("Expected empty wheelchair_accessible to parse as nil")
			}
			gtfs := &types.Gtfs{}
			validations.WheelchairAccessibleValidation(&trip, tc.Row, gtfs, &types.TripsRules{WheelchairAccessible: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, 0, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 0, tc.Name, types.SEVERITY_WARNING)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 0, tc.Name, types.SEVERITY_FORBIDDEN)
		})
	}
}
