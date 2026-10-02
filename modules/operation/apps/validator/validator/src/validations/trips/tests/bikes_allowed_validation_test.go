package trips

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/trips/validations"
	"testing"
)

func TestAllBikesAllowedValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetThreeStateValidOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("bikes_allowed", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}

			var bikesAllowed *int
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok {
					bikesAllowed = ptr
				}
			}

			trip := &types.Trip{BikesAllowed: bikesAllowed}
			gtfs := &types.Gtfs{}
			validations.BikesAllowedValidation(trip, tc.Row, gtfs, &types.TripsRules{BikesAllowed: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	for _, tc := range test_helpers.GetGenericSeverityTestCases("bikes_allowed") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			trip := &types.Trip{BikesAllowed: nil}
			gtfs := &types.Gtfs{}
			validations.BikesAllowedValidation(trip, tc.Row, gtfs, &types.TripsRules{BikesAllowed: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
