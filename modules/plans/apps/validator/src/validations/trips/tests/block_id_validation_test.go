package trips

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/trips/validations"
	"testing"
)

func TestAllBlockIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("block_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var severity types.Severity
			if tc.ExpectedErrors > 0 {
				severity = types.SEVERITY_ERROR
			} else {
				severity = types.SEVERITY_WARNING
			}

			trip := &types.Trip{BlockId: tc.Value}

			if tc.Name == "Invalid_Value" {
				trip = &types.Trip{}
			}

			gtfs := &types.Gtfs{}
			validations.BlockIdValidation(trip, tc.Row, gtfs, &types.TripsRules{BlockId: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("block_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			trip := &types.Trip{BlockId: nil}
			gtfs := &types.Gtfs{}
			validations.BlockIdValidation(trip, tc.Row, gtfs, &types.TripsRules{BlockId: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
