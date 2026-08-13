package fare_attributes

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/fare_attributes/validations"
	"testing"
)

func TestAllCurrencyTypeValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("currency_type") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var currencyType *string
			if tc.Value != nil {
				if tc.Name == "Valid_Present" {
					validCurrency := "USD"
					currencyType = &validCurrency
				} else {
					currencyType = tc.Value
				}
			}

			fareAttribute := &types.FareAttribute{CurrencyType: currencyType}
			validations.CurrencyTypeValidation(fareAttribute, tc.Row)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
