package agency

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/agency/validations"
	"testing"
)

func TestAllAgencyTimezoneValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetValidTimezones()
	fieldName := "agency_timezone"

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

			agency := &types.Agency{}
			if tc.Name == "Invalid_Value" {
				agency = &types.Agency{}
			} else if tc.Value != nil {
				agency = &types.Agency{AgencyTimezone: lib.Ptr(validOptions[0])}
			}

			validations.AgencyTimezoneValidation(agency, tc.Row, &types.AgencyRules{AgencyTimezone: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
