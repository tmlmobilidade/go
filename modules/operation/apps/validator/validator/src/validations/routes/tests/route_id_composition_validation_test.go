package routes

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/routes/validations"
	"testing"
)

func TestRouteIdCompositionValidation(t *testing.T) {
	rules := &types.RoutesRules{RouteIdComposition: types.RuleConfig{Severity: types.SEVERITY_WARNING}}

	testCases := []struct {
		name             string
		route            types.Route
		expectedWarnings int
	}{
		{
			name:             "Composed_Valid",
			route:            types.Route{RouteId: lib.Ptr("1001_0"), RouteShortName: lib.Ptr("1001"), RouteSortOrder: lib.Ptr(0)},
			expectedWarnings: 0,
		},
		{
			name:             "ComposedWithMultiDigitSortOrder_Valid",
			route:            types.Route{RouteId: lib.Ptr("1001_12"), RouteShortName: lib.Ptr("1001"), RouteSortOrder: lib.Ptr(12)},
			expectedWarnings: 0,
		},
		{
			name:             "MissingSortOrderSuffix_Invalid",
			route:            types.Route{RouteId: lib.Ptr("1001"), RouteShortName: lib.Ptr("1001"), RouteSortOrder: lib.Ptr(0)},
			expectedWarnings: 1,
		},
		{
			name:             "WrongSortOrder_Invalid",
			route:            types.Route{RouteId: lib.Ptr("1001_1"), RouteShortName: lib.Ptr("1001"), RouteSortOrder: lib.Ptr(0)},
			expectedWarnings: 1,
		},
		{
			name:             "WrongShortName_Invalid",
			route:            types.Route{RouteId: lib.Ptr("1002_0"), RouteShortName: lib.Ptr("1001"), RouteSortOrder: lib.Ptr(0)},
			expectedWarnings: 1,
		},
		{
			name:             "WrongSeparator_Invalid",
			route:            types.Route{RouteId: lib.Ptr("1001-0"), RouteShortName: lib.Ptr("1001"), RouteSortOrder: lib.Ptr(0)},
			expectedWarnings: 1,
		},
		{
			name:             "MissingShortName_Skipped",
			route:            types.Route{RouteId: lib.Ptr("1001_0"), RouteSortOrder: lib.Ptr(0)},
			expectedWarnings: 0,
		},
		{
			name:             "EmptyShortName_Skipped",
			route:            types.Route{RouteId: lib.Ptr("1001_0"), RouteShortName: lib.Ptr(""), RouteSortOrder: lib.Ptr(0)},
			expectedWarnings: 0,
		},
		{
			name:             "MissingSortOrder_Skipped",
			route:            types.Route{RouteId: lib.Ptr("1001_0"), RouteShortName: lib.Ptr("1001")},
			expectedWarnings: 0,
		},
		{
			name:             "MissingRouteId_Skipped",
			route:            types.Route{RouteShortName: lib.Ptr("1001"), RouteSortOrder: lib.Ptr(0)},
			expectedWarnings: 0,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			services.AppMessageService.Clear()
			validations.RouteIdCompositionValidation(&tc.route, 1, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.expectedWarnings, tc.name, types.SEVERITY_WARNING)
		})
	}
}

func TestRouteIdCompositionValidationIgnoredByDefault(t *testing.T) {
	services.AppMessageService.Clear()
	route := types.Route{RouteId: lib.Ptr("wrong"), RouteShortName: lib.Ptr("1001"), RouteSortOrder: lib.Ptr(0)}
	validations.RouteIdCompositionValidation(&route, 1, nil)
	test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "IgnoredByDefault", types.SEVERITY_WARNING)
}
