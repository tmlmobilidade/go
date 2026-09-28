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
			validations.ShapeIdValidation(trip, tc.Row, gtfs, &types.TripsRules{ShapeId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	// shape_id is unconditionally required: missing it is always an error,
	// regardless of what severity is configured for the rule.
	for _, severity := range []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_IGNORE, types.SEVERITY_FORBIDDEN, ""} {
		t.Run("Required_Missing_"+string(severity), func(t *testing.T) {
			services.AppMessageService.Clear()
			trip := &types.Trip{RouteId: lib.Ptr("route1"), TripId: lib.Ptr("trip1"), ShapeId: nil}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"routes": {"route1": {1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			var rules *types.TripsRules
			if severity != "" {
				rules = &types.TripsRules{ShapeId: types.RuleConfig{Severity: severity}}
			}
			validations.ShapeIdValidation(trip, 1, gtfs, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Required_Missing", types.SEVERITY_ERROR)
		})
	}

	t.Run("NilRules_MissingRouteId_StillRequiresShapeId", func(t *testing.T) {
		services.AppMessageService.Clear()
		trip := &types.Trip{TripId: lib.Ptr("trip1"), ShapeId: nil}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.ShapeIdValidation(trip, 1, gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "NilRules_MissingRouteId", types.SEVERITY_ERROR)
	})
}
