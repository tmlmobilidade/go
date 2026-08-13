package agency

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/agency/validations"
	"testing"
)

func TestAllAgencyLangValidationTestCases(t *testing.T) {
	fieldName := "agency_lang"

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

			var agencyLang *string
			if tc.Name == "Valid_Present" {
				value := test_helpers.GetValidLanguageCodes()[0]
				agencyLang = &value
			} else {
				agencyLang = tc.Value
			}

			validations.AgencyLangValidation(&types.Agency{AgencyLang: agencyLang}, tc.Row, &types.AgencyRules{AgencyLang: types.RuleConfig{Severity: severity}})
			if tc.Name == "Recommended_Missing" {
				test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
			} else {
				test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			}
		})
	}
}
