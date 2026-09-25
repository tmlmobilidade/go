package trips

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/trips/validations"
	"testing"
)

func TestAllShapeIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("shape_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var shapeId *string
			if tc.Id != nil {
				shapeId = tc.Id
			}

			trip := &types.Trip{
				RouteId: lib.Ptr("route1"),
				TripId:  lib.Ptr("trip1"),
				ShapeId: shapeId,
			}

			if tc.Name == "ForeignKey_Invalid" {
				trip = &types.Trip{
					RouteId: lib.Ptr("route1"),
					TripId:  lib.Ptr("trip1"),
					ShapeId: nil,
				}
			}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"shapes": {*tc.Id: {1}}, "routes": {"route1": {1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.ShapeIdValidation(trip, tc.Row, gtfs, &types.TripsRules{ShapeId: types.RuleConfig{Severity: types.SEVERITY_ERROR}}, make(map[string][]types.StopTimeRaw), make(map[string][]int))
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("shape_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			trip := &types.Trip{RouteId: lib.Ptr("route1"), TripId: lib.Ptr("trip1"), ShapeId: nil}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"routes": {"route1": {1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.ShapeIdValidation(trip, tc.Row, gtfs, &types.TripsRules{ShapeId: types.RuleConfig{Severity: tc.Severity}}, make(map[string][]types.StopTimeRaw), make(map[string][]int))
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	t.Run("Valid_Cache", func(t *testing.T) {
		services.AppMessageService.Clear()
		trip := &types.Trip{RouteId: lib.Ptr("route1"), TripId: lib.Ptr("trip1"), ShapeId: nil}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"routes": {"route1": {1}}, "stop_times": {"trip1": {1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.ShapeIdValidation(trip, 1, gtfs, nil, make(map[string][]types.StopTimeRaw), make(map[string][]int))
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Shape ID is required", types.SEVERITY_ERROR)
	})
	t.Run("Invalid_Cache", func(t *testing.T) {
		services.AppMessageService.Clear()
		trip := &types.Trip{RouteId: lib.Ptr("route1"), TripId: lib.Ptr("trip1"), ShapeId: nil}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"routes": {"route1": {1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.ShapeIdValidation(trip, 1, gtfs, &types.TripsRules{ShapeId: types.RuleConfig{Severity: types.SEVERITY_ERROR}}, make(map[string][]types.StopTimeRaw), make(map[string][]int))
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Shape ID is required", types.SEVERITY_ERROR)
	})
}
