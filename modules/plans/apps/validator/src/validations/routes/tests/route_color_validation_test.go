package routes

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/routes/validations"
	"testing"
)

func TestAllRouteColorValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericColorTestCases("route_color") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var rules *types.RoutesRules
			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}

			if tc.Name == "Nil_Color_Optional" {
				rules = nil
			} else {
				rules = &types.RoutesRules{RouteColor: types.RuleConfig{Severity: severity}}
			}
			validations.RouteColorValidation(&types.Route{RouteColor: tc.Color}, tc.Row, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
