package fare_attributes

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/fare_attributes/validations"
	"testing"
)

func TestAllTransfersValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetThreeStateValidOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("transfers", validOptions) {
		if tc.Name == "Required" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var transfers *int
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok {
					transfers = ptr
				}
			}
			if tc.Name == "Missing_Value_Required" {
				// Expected errors should be 0 because if the value is missing come empty and this is considered
				tc.ExpectedErrors = 0
			}
			validations.TransfersValidation(&types.FareAttribute{Transfers: transfers}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
