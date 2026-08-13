package routes

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/routes/validations"
	"testing"
)

func TestAllRouteUrlValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericUrlTestCases("route_url") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}
			validations.RouteUrlValidation(&types.Route{RouteUrl: tc.Url}, tc.Row, nil, &types.RoutesRules{RouteUrl: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
