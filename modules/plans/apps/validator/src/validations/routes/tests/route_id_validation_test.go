package routes

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/routes/validations"
	"testing"
)

func TestAllRouteIdValidationTestCases(t *testing.T) {
	fieldName := "route_id"
	for _, tc := range test_helpers.GetGenericIdTestCases(fieldName) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"routes": tc.ExistingIds}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.RouteIdValidation(&types.Route{RouteId: tc.Id}, tc.Row, gtfs)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}

	for _, tc := range test_helpers.GetGenericSeverityTestCases("route_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var routeId *string
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*string); ok {
					routeId = ptr
				}
			}

			gtfsIdMap := types.GtfsIdMap{}
			if routeId != nil {
				gtfsIdMap["routes"] = map[string][]int{*routeId: {1, 2}}
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: gtfsIdMap}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			validations.RouteIdValidation(&types.Route{RouteId: routeId}, tc.Row, gtfs)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, tc.Severity)
		})
	}
}
