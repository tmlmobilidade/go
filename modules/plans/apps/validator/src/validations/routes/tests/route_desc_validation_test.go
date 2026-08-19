package routes

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/routes/validations"
	"testing"
)

func TestAllRouteDescValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("route_desc") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var routeDesc *string
			if tc.Value != nil {
				routeDesc = tc.Value
			}

			validations.RouteDescValidation(&types.Route{RouteDesc: routeDesc}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}

	for _, tc := range test_helpers.GetGenericSeverityTestCases("route_desc") {
		if tc.Name == "Severity_Warning_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var routeDesc *string
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*string); ok && ptr != nil {
					routeDesc = ptr
				}
			}
			validations.RouteDescValidation(&types.Route{RouteDesc: routeDesc}, tc.Row, &types.RoutesRules{RouteDesc: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, tc.Severity)
		})
	}

	t.Run("Duplicate_ShortName", func(t *testing.T) {
		services.AppMessageService.Clear()
		desc := "Route A"
		shortName := "Route A"
		route := &types.Route{
			RouteDesc:      &desc,
			RouteShortName: &shortName,
		}
		validations.RouteDescValidation(route, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Duplicate short name should warn", types.SEVERITY_WARNING)
	})
	t.Run("Duplicate_Both_Short_And_Long_Name", func(t *testing.T) {
		services.AppMessageService.Clear()
		desc := "Route A"
		shortName := "Route A"
		longName := "Route A"
		route := &types.Route{
			RouteDesc:      &desc,
			RouteShortName: &shortName,
			RouteLongName:  &longName,
		}
		validations.RouteDescValidation(route, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 2, "Duplicate both short and long name should warn", types.SEVERITY_WARNING)
	})
	t.Run("Unique_Route_Desc", func(t *testing.T) {
		services.AppMessageService.Clear()
		desc := "Route A"
		route := &types.Route{
			RouteDesc: &desc,
		}
		validations.RouteDescValidation(route, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Unique route_desc should not warn", types.SEVERITY_WARNING)
	})
	t.Run("Required_When_ShortName_Empty", func(t *testing.T) {
		services.AppMessageService.Clear()
		route := &types.Route{
			RouteDesc:      nil,
			RouteShortName: nil,
		}
		validations.RouteDescValidation(route, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Required when short name is empty should error", types.SEVERITY_ERROR)
	})

	t.Run("NotAllowed_WithOptions", func(t *testing.T) {
		services.AppMessageService.Clear()
		allowedOptions := []string{"Description 1", "Description 2"}
		desc := "Invalid Description"
		route := &types.Route{
			RouteDesc: &desc,
		}
		validations.RouteDescValidation(route, 1, &types.RoutesRules{RouteDesc: types.RuleConfig{Options: &allowedOptions, Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Not allowed route_desc should error", types.SEVERITY_ERROR)
	})
}
