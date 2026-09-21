package transfers_tests

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/transfers/validations"
	"testing"
)

func TestAllMinTransferTimeValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("min_transfer_time") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			severity := types.SEVERITY_ERROR
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			}

			var minTransferTime *int
			if tc.Name == "Invalid_Value" {
				minTransferTime = lib.Ptr(-1)
			} else if tc.Value != nil {
				minTransferTime = lib.Ptr(int(1))
			} else {
				minTransferTime = nil
			}

			validations.MinTransferTimeValidation(&types.Transfers{MinTransferTime: minTransferTime}, tc.Row, &types.TransfersRules{MinTransferTime: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
