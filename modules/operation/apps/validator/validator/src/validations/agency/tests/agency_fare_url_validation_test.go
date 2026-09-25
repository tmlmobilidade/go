package agency

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/agency/validations"
	"testing"
)

func TestAllAgencyFareUrlValidationTestCases(t *testing.T) {
	fieldName := "agency_fare_url"

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

			var agencyFareUrl *string
			if tc.Name == "Valid_Present" {
				value := test_helpers.GetValidUrls()[0]
				agencyFareUrl = &value
			} else {
				agencyFareUrl = tc.Value
			}

			validations.AgencyFareUrlValidation(&types.Agency{AgencyFareUrl: agencyFareUrl}, tc.Row, &types.AgencyRules{AgencyFare: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
