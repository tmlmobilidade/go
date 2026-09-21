package agency

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/agency/validations"
	"testing"
)

func TestAllAgencyUrlValidationTestCases(t *testing.T) {
	fieldName := "agency_url"

	for _, tc := range test_helpers.GetGenericUrlTestCases(fieldName) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var severity types.Severity
			if tc.Name == "Required" {
				severity = types.SEVERITY_ERROR
			} else {
				severity = types.SEVERITY_WARNING
			}

			validations.AgencyUrlValidation(&types.Agency{AgencyUrl: tc.Url}, tc.Row, &types.AgencyRules{AgencyUrl: types.RuleConfig{Severity: severity}})
			if tc.Name == "Recommended_Missing" {
				test_helpers.AssertMessageCount(t, services.AppMessageService, 1, tc.Name, types.SEVERITY_WARNING)
			} else {
				test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			}
		})
	}
}
