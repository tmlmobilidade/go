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

func TestAllContinuousPickupValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetFourStateValidOptions()
	validOptionsStrings := make([]string, len(validOptions))
	for i, opt := range validOptions {
		validOptionsStrings[i] = fmt.Sprintf("%d", opt)
	}

	for _, tc := range test_helpers.GetGenericEnumIntTestCases("continuous_pickup", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}

			// Convert tc.Value (*int or nil) to *string for ContinuousPickup field
			var continuousPickup *string
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok && ptr != nil {
					valStr := fmt.Sprintf("%d", *ptr)
					continuousPickup = &valStr
				}
			}

			validations.ContinuousPickupValidation(
				&types.Route{ContinuousPickup: continuousPickup},
				tc.Row,
				&types.Gtfs{},
				&types.RoutesRules{
					ContinuousPickup: types.RuleConfig{
						Severity: severity,
						Options:  &validOptionsStrings,
					},
				},
				nil,
			)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	t.Run("Forbidden_WithStartWindow", func(t *testing.T) {
		services.AppMessageService.Clear()
		routeId := "ROUTE1"
		routesWithWindows := map[string]bool{routeId: true}
		validations.ContinuousPickupValidation(&types.Route{RouteId: &routeId, ContinuousPickup: lib.Ptr("0")}, 3, &types.Gtfs{}, nil, routesWithWindows)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_WithStartWindow", types.SEVERITY_ERROR)
	})
	t.Run("Forbidden_WithEndWindow", func(t *testing.T) {
		services.AppMessageService.Clear()
		routeId := "ROUTE1"
		routesWithWindows := map[string]bool{routeId: true}
		validations.ContinuousPickupValidation(&types.Route{RouteId: &routeId, ContinuousPickup: lib.Ptr("0")}, 4, &types.Gtfs{}, nil, routesWithWindows)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_WithEndWindow", types.SEVERITY_ERROR)
	})
	t.Run("Allowed_WithStartWindowIfOne", func(t *testing.T) {
		services.AppMessageService.Clear()
		routeId := "ROUTE1"
		routesWithWindows := map[string]bool{routeId: true}
		validations.ContinuousPickupValidation(&types.Route{RouteId: &routeId, ContinuousPickup: lib.Ptr("1")}, 5, &types.Gtfs{}, nil, routesWithWindows)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Allowed_WithStartWindowIfOne", types.SEVERITY_WARNING)
	})
	t.Run("Allowed_WithEndWindowIfOne", func(t *testing.T) {
		services.AppMessageService.Clear()
		routeId := "ROUTE1"
		routesWithWindows := map[string]bool{routeId: true}
		validations.ContinuousPickupValidation(&types.Route{RouteId: &routeId, ContinuousPickup: lib.Ptr("1")}, 6, &types.Gtfs{}, nil, routesWithWindows)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Allowed_WithEndWindowIfOne", types.SEVERITY_WARNING)
	})
	t.Run("Allowed_WithStartWindowIfOneAndEndWindowIfOne", func(t *testing.T) {
		services.AppMessageService.Clear()
		routeId := "ROUTE1"
		routesWithWindows := map[string]bool{routeId: true}
		validations.ContinuousPickupValidation(&types.Route{RouteId: &routeId, ContinuousPickup: lib.Ptr("1")}, 7, &types.Gtfs{}, nil, routesWithWindows)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Allowed_WithStartWindowIfOneAndEndWindowIfOne", types.SEVERITY_WARNING)
	})
}
