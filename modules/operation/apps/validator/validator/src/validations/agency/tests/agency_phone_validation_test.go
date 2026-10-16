package agency

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/agency/validations"
	"testing"
)

func TestAllAgencyPhoneValidationTestCases(t *testing.T) {
	fieldName := "agency_phone"

	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases(fieldName) {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var severity types.Severity
			if tc.ExpectedErrors > 0 {
				severity = types.SEVERITY_ERROR
			} else {
				severity = types.SEVERITY_WARNING
			}

			agency := map[string]*string{}
			if tc.Name == "Invalid_Value" {
				agency = map[string]*string{}
			} else if tc.Value != nil {
				agency = map[string]*string{"agency_phone": lib.Ptr(test_helpers.GetValidPhoneNumbers()[0])}
			}

			assertAgencyRead(t, validations.AgencyPhoneValidation(agencyRow(t, tc.Row, agency), &types.AgencyRules{AgencyPhone: types.RuleConfig{Severity: severity}}))
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
