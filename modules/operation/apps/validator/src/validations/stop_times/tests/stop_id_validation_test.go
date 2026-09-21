package stop_times

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stop_times/validations"
	"testing"
)

func TestAllStopIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("stop_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var stopTime *types.StopTime
			if tc.Name == "ForeignKey_Invalid" {
				stopTime = &types.StopTime{}
			} else if tc.Id != nil {
				stopTime = &types.StopTime{StopId: tc.Id}
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": map[string][]int{*tc.Id: {1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.StopIdValidation(stopTime, tc.Row, gtfs, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	t.Run("InvalidLocationType", func(t *testing.T) {
		services.AppMessageService.Clear()

		stopId := "S2"
		stopTime := &types.StopTime{
			StopId: &stopId,
		}

		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.StopIdValidation(stopTime, 5, gtfs, map[string]string{"S2": "1"})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "stop_id with invalid location_type should error", types.SEVERITY_ERROR)
	})
}
