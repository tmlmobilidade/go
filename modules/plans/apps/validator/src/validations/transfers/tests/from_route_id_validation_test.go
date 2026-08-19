package transfers_tests

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/transfers/validations"
	"testing"
)

func TestAllFromRouteIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("from_route_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var fromRouteId *string
			if tc.Id != nil {
				fromRouteId = tc.Id
			}

			transfer := &types.Transfers{FromRouteId: fromRouteId, FromTripId: nil}

			var routesIdMap map[string][]int
			if tc.Name == "ForeignKey_Invalid" {
				routesIdMap = map[string][]int{}
			} else if fromRouteId != nil {
				routesIdMap = map[string][]int{*fromRouteId: {0}}
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

			validations.FromRouteIdValidation(transfer, tc.Row, *gtfs, &types.TransfersRules{FromRouteId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}

	for _, tc := range test_helpers.GetGenericSeverityTestCases("from_route_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			transfer := &types.Transfers{FromRouteId: nil, FromTripId: nil}

			gtfs, cleanup, err := test_helpers.MockGtfs{
				IdMapData: types.GtfsIdMap{"routes": map[string][]int{}},
			}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			validations.FromRouteIdValidation(transfer, tc.Row, *gtfs, &types.TransfersRules{FromRouteId: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	t.Run("Valid_FromRouteId_And_FromTripId_SameRoute", func(t *testing.T) {
		services.AppMessageService.Clear()
		transfer := &types.Transfers{FromRouteId: lib.Ptr("route1"), FromTripId: lib.Ptr("trip1")}

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

		validations.FromRouteIdValidation(transfer, 1, *gtfs, &types.TransfersRules{FromRouteId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_FromRouteId_And_FromTripId_SameRoute", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_FromRouteId_And_FromTripId_SameRoute", types.SEVERITY_WARNING)
	})

	t.Run("Invalid_FromRouteId_And_FromTripId_TripBelongsToDifferentRoute", func(t *testing.T) {
		services.AppMessageService.Clear()
		transfer := &types.Transfers{FromRouteId: lib.Ptr("route1"), FromTripId: lib.Ptr("trip1")}

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

		validations.FromRouteIdValidation(transfer, 1, *gtfs, &types.TransfersRules{FromRouteId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_FromRouteId_And_FromTripId_TripBelongsToDifferentRoute", types.SEVERITY_ERROR)
	})

	t.Run("Valid_FromRouteId_Only_FromTripIdNil", func(t *testing.T) {
		services.AppMessageService.Clear()
		transfer := &types.Transfers{FromRouteId: lib.Ptr("route1"), FromTripId: nil}

		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"routes": map[string][]int{"route1": {0}}},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		validations.FromRouteIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_FromRouteId_Only_FromTripIdNil", types.SEVERITY_ERROR)
	})

	t.Run("Valid_FromTripId_Only_FromRouteIdNil", func(t *testing.T) {
		services.AppMessageService.Clear()
		transfer := &types.Transfers{FromRouteId: nil, FromTripId: lib.Ptr("trip1")}

		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"trips": map[string][]int{"trip1": {0}}},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		validations.FromRouteIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_FromTripId_Only_FromRouteIdNil", types.SEVERITY_ERROR)
	})
}
