package routes

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/routes/validations"
	"testing"
)

func TestAllRouteLongNameValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("route_long_name") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}

			var routeLongName *string
			if tc.Value != nil {
				routeLongName = tc.Value
			}

			validations.RouteLongNameValidation(&types.Route{RouteLongName: routeLongName}, tc.Row, &types.RoutesRules{RouteLongName: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	t.Run("Required_When_ShortName_Empty", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.RouteLongNameValidation(&types.Route{RouteLongName: nil, RouteShortName: nil}, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Required when short name is empty should error", types.SEVERITY_ERROR)
	})
}
