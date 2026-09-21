package routes

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/routes/validations"
	"testing"
)

func TestAllNetworkIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericIdTestCases("network_id") {
		// Skip duplicate test case - network_id allows duplicates per GTFS spec
		// "Multiple rows in [routes.txt] may have the same network_id"
		if tc.Name == "Duplicate_Id" {
			continue
		}

		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			validations.NetworkIdValidation(&types.Route{NetworkId: tc.Id}, tc.Row, &types.Gtfs{}, &types.RoutesRules{NetworkId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}

	for _, tc := range test_helpers.GetGenericSeverityTestCases("network_id") {
		if tc.Name != "Severity_Ignore_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			validations.NetworkIdValidation(&types.Route{NetworkId: nil}, tc.Row, &types.Gtfs{}, &types.RoutesRules{NetworkId: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	t.Run("Allowed_WhenRouteNetworksEmpty", func(t *testing.T) {
		services.AppMessageService.Clear()
		networkId := "NETWORK1"
		route := &types.Route{NetworkId: &networkId}
		gtfs := &types.Gtfs{
			RouteNetwork: []types.RouteNetworkRaw{},
		}
		rules := &types.RoutesRules{
			NetworkId: types.RuleConfig{
				Severity: types.SEVERITY_ERROR,
			},
		}
		validations.NetworkIdValidation(route, 1, gtfs, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "network_id should be allowed when route_networks is empty", types.SEVERITY_WARNING)
	})
	t.Run("NotAllowed_WhenNetworkIdNotAllowed", func(t *testing.T) {
		services.AppMessageService.Clear()
		allowedOptions := []string{"NETWORK1", "NETWORK2"}
		networkId := "NETWORK3"
		route := &types.Route{NetworkId: &networkId}
		gtfs := &types.Gtfs{}
		rules := &types.RoutesRules{
			NetworkId: types.RuleConfig{
				Severity: types.SEVERITY_ERROR,
				Options:  &allowedOptions,
			},
		}
		validations.NetworkIdValidation(route, 1, gtfs, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Not allowed network_id should error", types.SEVERITY_ERROR)
	})
	t.Run("Allowed_WhenAllOptions", func(t *testing.T) {
		services.AppMessageService.Clear()
		allOptions := []string{types.ALL_OPTIONS}
		networkId := "ANY_NETWORK"
		route := &types.Route{NetworkId: &networkId}
		gtfs := &types.Gtfs{}
		rules := &types.RoutesRules{
			NetworkId: types.RuleConfig{
				Severity: types.SEVERITY_ERROR,
				Options:  &allOptions,
			},
		}
		validations.NetworkIdValidation(route, 1, gtfs, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "ALL_OPTIONS should allow any network_id", types.SEVERITY_WARNING)
	})
}
