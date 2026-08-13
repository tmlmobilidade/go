package stop_times

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stop_times/validations"
	"testing"
)

func TestAllTripIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("trip_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var stopTime *types.StopTime
			if tc.Id != nil {
				stopTime = &types.StopTime{TripId: tc.Id}
			} else {
				stopTime = &types.StopTime{}
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": {*tc.Id: {1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			if tc.Name == "ForeignKey_Invalid" {
				gtfs, cleanup, err = test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": {}}}.ToGtfsWithDB()
				if err != nil {
					t.Fatalf("failed to create mock gtfs: %v", err)
				}
				defer cleanup()
			}

			validations.TripIdValidation(stopTime, tc.Row, gtfs)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	t.Run("Missing_TripsIndex", func(t *testing.T) {
		services.AppMessageService.Clear()
		stopTime := &types.StopTime{TripId: lib.Ptr("T1")}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": {"T1": {1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.TripIdValidation(stopTime, 1, gtfs)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Missing_TripsIndex", types.SEVERITY_ERROR)
	})
	t.Run("Empty_TripId", func(t *testing.T) {
		services.AppMessageService.Clear()
		stopTime := &types.StopTime{TripId: nil}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": {"T1": {1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.TripIdValidation(stopTime, 1, gtfs)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Empty_TripId", types.SEVERITY_ERROR)
	})
}
