package routes

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/routes/validations"
	"testing"
)

func TestRouteIdFormatValidation(t *testing.T) {
	rules := &types.RoutesRules{RouteIdFormat: types.RuleConfig{Severity: types.SEVERITY_WARNING}}

	testCases := []struct {
		name             string
		route            types.Route
		expectedWarnings int
	}{
		{
			name:             "Valid_Format",
			route:            types.Route{RouteId: lib.Ptr("1001_0"), RouteShortName: lib.Ptr("1001"), RouteSortOrder: lib.Ptr(0)},
			expectedWarnings: 0,
		},
		{
			name:             "Valid_Format_With_Multi_Digit_Sort_Order",
			route:            types.Route{RouteId: lib.Ptr("1001_12"), RouteShortName: lib.Ptr("1001"), RouteSortOrder: lib.Ptr(12)},
			expectedWarnings: 0,
		},
		{
			name:             "Invalid_Format_Missing_Sort_Order_Suffix",
			route:            types.Route{RouteId: lib.Ptr("1001"), RouteShortName: lib.Ptr("1001"), RouteSortOrder: lib.Ptr(0)},
			expectedWarnings: 1,
		},
		{
			name:             "Invalid_Format_Wrong_Sort_Order",
			route:            types.Route{RouteId: lib.Ptr("1001_1"), RouteShortName: lib.Ptr("1001"), RouteSortOrder: lib.Ptr(0)},
			expectedWarnings: 1,
		},
		{
			name:             "Invalid_Format_Wrong_Short_Name",
			route:            types.Route{RouteId: lib.Ptr("1002_0"), RouteShortName: lib.Ptr("1001"), RouteSortOrder: lib.Ptr(0)},
			expectedWarnings: 1,
		},
		{
			name:             "Invalid_Format_Wrong_Separator",
			route:            types.Route{RouteId: lib.Ptr("1001-0"), RouteShortName: lib.Ptr("1001"), RouteSortOrder: lib.Ptr(0)},
			expectedWarnings: 1,
		},
		{
			name:             "Skipped_Missing_Short_Name",
			route:            types.Route{RouteId: lib.Ptr("1001_0"), RouteSortOrder: lib.Ptr(0)},
			expectedWarnings: 0,
		},
		{
			name:             "Skipped_Empty_Short_Name",
			route:            types.Route{RouteId: lib.Ptr("1001_0"), RouteShortName: lib.Ptr(""), RouteSortOrder: lib.Ptr(0)},
			expectedWarnings: 0,
		},
		{
			name:             "Skipped_Missing_Sort_Order",
			route:            types.Route{RouteId: lib.Ptr("1001_0"), RouteShortName: lib.Ptr("1001")},
			expectedWarnings: 0,
		},
		{
			name:             "Skipped_Missing_Route_Id",
			route:            types.Route{RouteShortName: lib.Ptr("1001"), RouteSortOrder: lib.Ptr(0)},
			expectedWarnings: 0,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			services.AppMessageService.Clear()
			validations.RouteIdFormatValidation(&tc.route, 1, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.expectedWarnings, tc.name, types.SEVERITY_WARNING)
		})
	}
}

func TestRouteIdFormatValidationIgnoredByDefault(t *testing.T) {
	services.AppMessageService.Clear()
	route := types.Route{RouteId: lib.Ptr("wrong"), RouteShortName: lib.Ptr("1001"), RouteSortOrder: lib.Ptr(0)}
	validations.RouteIdFormatValidation(&route, 1, nil)
	test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "IgnoredByDefault", types.SEVERITY_WARNING)
}
