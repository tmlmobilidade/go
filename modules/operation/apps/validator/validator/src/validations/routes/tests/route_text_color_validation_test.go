package routes

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/routes/validations"
	"testing"
)

func TestAllRouteTextColorValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericColorTestCases("route_text_color") {
		expectedErrors := tc.ExpectedErrors
		// route_text_color is required: missing is an error
		if tc.Name == "Nil_Color_Optional" {
			expectedErrors = 1
		}

		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			validations.RouteTextColorValidation(&types.Route{RouteTextColor: tc.Color}, tc.Row, &types.RoutesRules{RouteTextColor: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, expectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
