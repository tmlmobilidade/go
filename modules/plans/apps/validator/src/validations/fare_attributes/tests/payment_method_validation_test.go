package fare_attributes

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/fare_attributes/validations"
	"testing"
)

func TestAllPaymentMethodValidationTestCases(t *testing.T) {
	validOptions := []int{0, 1}
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("payment_method", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var paymentMethod *int
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok {
					paymentMethod = ptr
				}
			}
			fareAttribute := &types.FareAttribute{PaymentMethod: paymentMethod}
			validations.PaymentMethodValidation(fareAttribute, tc.Row)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
