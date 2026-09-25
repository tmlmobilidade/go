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

	testCases := []struct {
		Name           string
		Timezone       *string
		ExpectedErrors int
	}{
		{Name: "Optional_Missing", Timezone: nil, ExpectedErrors: 0},
		{Name: "Valid_Value", Timezone: lib.Ptr(validOptions[0]), ExpectedErrors: 0},
		{Name: "Invalid_Value", Timezone: lib.Ptr("Not/A_Timezone"), ExpectedErrors: 1},
	}

	for _, tc := range testCases {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			agency := &types.Agency{AgencyTimezone: tc.Timezone}

			// agency_timezone is optional: no rules configured means a missing
			// value is ignored, while an invalid value is always an error.
			validations.AgencyTimezoneValidation(agency, 1, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
