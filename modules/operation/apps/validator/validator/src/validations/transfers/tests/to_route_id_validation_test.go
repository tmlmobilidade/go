package transfers_tests

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/transfers/validations"
	"testing"
)

func TestAllToRouteIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("to_route_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var toRouteId *string
			if tc.Id != nil {
				toRouteId = tc.Id
			}

			transfer := &types.Transfers{ToRouteId: toRouteId, ToTripId: nil}

			var routesIdMap map[string][]int
			if tc.Name == "ForeignKey_Invalid" {
				routesIdMap = map[string][]int{}
			} else if toRouteId != nil {
				routesIdMap = map[string][]int{*toRouteId: {0}}
			} else {
				routesIdMap = map[string][]int{}
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{
				IdMapData: types.GtfsIdMap{"routes": routesIdMap},
			}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			validations.ToRouteIdValidation(transfer, tc.Row, *gtfs, &types.TransfersRules{ToRouteId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}

	for _, tc := range test_helpers.GetGenericSeverityTestCases("to_route_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			transfer := &types.Transfers{ToRouteId: nil, ToTripId: nil}

			gtfs, cleanup, err := test_helpers.MockGtfs{
				IdMapData: types.GtfsIdMap{"routes": map[string][]int{}},
			}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			validations.ToRouteIdValidation(transfer, tc.Row, *gtfs, &types.TransfersRules{ToRouteId: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	t.Run("Valid_ToRouteId_And_ToTripId_SameRoute", func(t *testing.T) {
		services.AppMessageService.Clear()
		transfer := &types.Transfers{ToRouteId: lib.Ptr("route1"), ToTripId: lib.Ptr("trip1")}

		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{
				"routes": map[string][]int{"route1": {0}},
				"trips":  map[string][]int{"trip1": {0}},
			},
			TableData: map[string][]map[string]string{
				"trips": {{"trip_id": "trip1", "route_id": "route1"}},
			},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		validations.ToRouteIdValidation(transfer, 1, *gtfs, &types.TransfersRules{ToRouteId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_ToRouteId_And_ToTripId_SameRoute", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_ToRouteId_And_ToTripId_SameRoute", types.SEVERITY_WARNING)
	})

	t.Run("Invalid_ToRouteId_And_ToTripId_TripBelongsToDifferentRoute", func(t *testing.T) {
		services.AppMessageService.Clear()
		transfer := &types.Transfers{ToRouteId: lib.Ptr("route1"), ToTripId: lib.Ptr("trip1")}

		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{
				"routes": map[string][]int{"route1": {0}, "route2": {1}},
				"trips":  map[string][]int{"trip1": {0}},
			},
			TableData: map[string][]map[string]string{
				"trips": {{"trip_id": "trip1", "route_id": "route2"}},
			},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		validations.ToRouteIdValidation(transfer, 1, *gtfs, &types.TransfersRules{ToRouteId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_ToRouteId_And_ToTripId_TripBelongsToDifferentRoute", types.SEVERITY_ERROR)
	})

	t.Run("Valid_ToRouteId_Only_ToTripIdNil", func(t *testing.T) {
		services.AppMessageService.Clear()
		transfer := &types.Transfers{ToRouteId: lib.Ptr("route1"), ToTripId: nil}

		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"routes": map[string][]int{"route1": {0}}},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		validations.ToRouteIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_ToRouteId_Only_ToTripIdNil", types.SEVERITY_ERROR)
	})

	t.Run("Valid_ToTripId_Only_ToRouteIdNil", func(t *testing.T) {
		services.AppMessageService.Clear()
		transfer := &types.Transfers{ToRouteId: nil, ToTripId: lib.Ptr("trip1")}

		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"trips": map[string][]int{"trip1": {0}}},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		validations.ToRouteIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_ToTripId_Only_ToRouteIdNil", types.SEVERITY_ERROR)
	})
}
