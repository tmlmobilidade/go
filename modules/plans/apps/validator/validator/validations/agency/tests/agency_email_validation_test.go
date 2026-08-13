package agency

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/agency/validations"
	"testing"
)

func TestAllAgencyEmailTestCases(t *testing.T) {
	fieldName := "agency_email"

	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases(fieldName) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var severity types.Severity
			if tc.ExpectedErrors > 0 {
				severity = types.SEVERITY_ERROR
			} else {
				severity = types.SEVERITY_WARNING
			}

			var agencyEmail *string
			if tc.Name == "Valid_Present" {
				value := test_helpers.GetValidEmails()[0]
				agencyEmail = &value
			} else {
				agencyEmail = tc.Value
			}

			validations.AgencyEmailValidation(&types.Agency{AgencyEmail: agencyEmail}, tc.Row, &types.AgencyRules{AgencyEmail: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
