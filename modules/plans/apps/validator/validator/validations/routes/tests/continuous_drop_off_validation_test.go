package routes

import (
	"fmt"
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/routes/validations"
	"testing"
)

func TestAllContinuousDropOffValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetFourStateValidOptions()
	validOptionsStrings := make([]string, len(validOptions))
	for i, opt := range validOptions {
		validOptionsStrings[i] = fmt.Sprintf("%d", opt)
	}
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("continuous_drop_off", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}

			var continuousDropOff *string
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok && ptr != nil {
					valStr := fmt.Sprintf("%d", *ptr)
					continuousDropOff = &valStr
				}
			}

			routesWithWindows := make(map[string]bool)
			validations.ContinuousDropOffValidation(
				&types.Route{ContinuousDropOff: continuousDropOff},
				tc.Row,
				&types.Gtfs{},
				&types.RoutesRules{
					ContinuousDropOff: types.RuleConfig{
						Severity: severity,
						Options:  &validOptionsStrings,
					},
				},
				routesWithWindows,
			)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	for _, tc := range test_helpers.GetGenericSeverityTestCases("continuous_drop_off") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var continuousDropOff *string
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*string); ok && ptr != nil {
					continuousDropOff = ptr
				}
			}

			routesWithWindows := make(map[string]bool)
			validations.ContinuousDropOffValidation(
				&types.Route{ContinuousDropOff: continuousDropOff},
				tc.Row,
				&types.Gtfs{},
				&types.RoutesRules{
					ContinuousDropOff: types.RuleConfig{
						Severity: tc.Severity,
						Options:  &validOptionsStrings,
					},
				},
				routesWithWindows,
			)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	t.Run("Forbidden_WithStartWindow", func(t *testing.T) {
		services.AppMessageService.Clear()
		routeId := "ROUTE1"
		routesWithWindows := map[string]bool{routeId: true}
		validations.ContinuousDropOffValidation(&types.Route{RouteId: &routeId, ContinuousDropOff: lib.Ptr("0")}, 3, &types.Gtfs{}, nil, routesWithWindows)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_WithStartWindow", types.SEVERITY_ERROR)
	})
	t.Run("Forbidden_WithEndWindow", func(t *testing.T) {
		services.AppMessageService.Clear()
		routeId := "ROUTE1"
		routesWithWindows := map[string]bool{routeId: true}
		validations.ContinuousDropOffValidation(&types.Route{RouteId: &routeId, ContinuousDropOff: lib.Ptr("2")}, 4, &types.Gtfs{}, nil, routesWithWindows)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_WithEndWindow", types.SEVERITY_ERROR)
	})
	t.Run("Allowed_WithStartWindowIfOne", func(t *testing.T) {
		services.AppMessageService.Clear()
		routeId := "ROUTE1"
		routesWithWindows := map[string]bool{routeId: true}
		validations.ContinuousDropOffValidation(&types.Route{RouteId: &routeId, ContinuousDropOff: lib.Ptr("1")}, 5, &types.Gtfs{}, nil, routesWithWindows)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Allowed_WithStartWindowIfOne", types.SEVERITY_WARNING)
	})
	t.Run("Allowed_WithEndWindowIfOne", func(t *testing.T) {
		services.AppMessageService.Clear()
		routeId := "ROUTE1"
		routesWithWindows := map[string]bool{routeId: true}
		validations.ContinuousDropOffValidation(&types.Route{RouteId: &routeId, ContinuousDropOff: lib.Ptr("1")}, 6, &types.Gtfs{}, nil, routesWithWindows)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Allowed_WithEndWindowIfOne", types.SEVERITY_WARNING)
	})
	t.Run("Allowed_WithStartWindowIfOneAndEndWindowIfOne", func(t *testing.T) {
		services.AppMessageService.Clear()
		routeId := "ROUTE1"
		routesWithWindows := map[string]bool{routeId: true}
		validations.ContinuousDropOffValidation(&types.Route{RouteId: &routeId, ContinuousDropOff: lib.Ptr("1")}, 7, &types.Gtfs{}, nil, routesWithWindows)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Allowed_WithStartWindowIfOneAndEndWindowIfOne", types.SEVERITY_WARNING)
	})
}
