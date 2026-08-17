package routes

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/routes/validations"
	"testing"
)

func TestAllRouteShortNameValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("route_short_name") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			route := &types.Route{RouteShortName: tc.Value}
			if tc.Name == "Recommended_Missing" {
				route.RouteShortName = lib.Ptr("Long Route Name")
			}

			if tc.Name == "Invalid_Value" {
				route.RouteShortName = lib.Ptr("")
			}

			validations.RouteShortNameValidation(route, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	t.Run("TestShortNameTooLong", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.RouteShortNameValidation(&types.Route{RouteShortName: lib.Ptr("This is a very long route short name that exceeds 12 characters")}, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "TestShortNameTooLong should error", types.SEVERITY_WARNING)
	})

	t.Run("TestShortNameExactly12Characters", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.RouteShortNameValidation(&types.Route{RouteShortName: lib.Ptr("123456789012")}, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "TestShortNameExactly12Characters should not error", types.SEVERITY_WARNING)
	})

	t.Run("TestShortName13Characters", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.RouteShortNameValidation(&types.Route{RouteShortName: lib.Ptr("1234567890123")}, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "TestShortName13Characters should error", types.SEVERITY_WARNING)
	})

	t.Run("TestBothShortAndLongNameMissing", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.RouteShortNameValidation(&types.Route{RouteShortName: nil, RouteLongName: nil}, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "TestBothShortAndLongNameMissing should error", types.SEVERITY_ERROR)
	})

	t.Run("TestShortNameMissing_LongNamePresent", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.RouteShortNameValidation(&types.Route{RouteShortName: nil, RouteLongName: lib.Ptr("Long Route Name")}, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "TestShortNameMissing_LongNamePresent should not error", types.SEVERITY_ERROR)
	})

	t.Run("TestShortNameEmpty_LongNamePresent", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.RouteShortNameValidation(&types.Route{RouteShortName: lib.Ptr(""), RouteLongName: lib.Ptr("Long Route Name")}, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "TestShortNameEmpty_LongNamePresent should not error", types.SEVERITY_ERROR)
	})

	t.Run("TestWithOptions_NotAllowed", func(t *testing.T) {
		services.AppMessageService.Clear()
		options := []string{"1", "2", "3", "A", "B"}
		validations.RouteShortNameValidation(&types.Route{RouteShortName: lib.Ptr("X")}, 1, &types.RoutesRules{RouteShortName: types.RuleConfig{Options: &options, Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "TestWithOptions_NotAllowed should error", types.SEVERITY_ERROR)
	})

	t.Run("TestWithOptions_AllOptions", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.RouteShortNameValidation(&types.Route{RouteShortName: lib.Ptr("Any Name")}, 1, &types.RoutesRules{RouteShortName: types.RuleConfig{Options: &[]string{types.ALL_OPTIONS}, Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "TestWithOptions_AllOptions should not error", types.SEVERITY_ERROR)
	})
}
