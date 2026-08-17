package transfers_tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/transfers/validations"
	"testing"
)

func TestAllTransferTypeValidationTestCases(t *testing.T) {
	validOptions := []int{0, 1, 2, 3, 4, 5}
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("transfer_type", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var transferType *int
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok {
					transferType = ptr
				}
			}

			validations.TransferTypeValidation(&types.Transfers{TransferType: transferType}, tc.Row, &types.TransfersRules{TransferType: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
