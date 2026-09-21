package pathways_tests

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/pathways/validations"
	"testing"
)

func TestAllToStopIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("to_stop_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var toStopId *string
			if tc.Id != nil {
				toStopId = tc.Id
			}

			pathways := &types.Pathways{ToStopId: toStopId}

			var stopsIdMap map[string][]int
			if tc.Name == "ForeignKey_Invalid" {
				stopsIdMap = map[string][]int{}
			} else if toStopId != nil {
				stopsIdMap = map[string][]int{*toStopId: {1}}
			} else {
				stopsIdMap = map[string][]int{}
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": stopsIdMap}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			validations.ToStopIdValidation(pathways, tc.Row, gtfs, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	t.Run("Test_Valid_Platform_With_Stop_Access_1", func(t *testing.T) {
		services.AppMessageService.Clear()
		pathways := &types.Pathways{ToStopId: lib.Ptr("S1")}
		stopData := map[string]string{
			"stop_id":       "S1",
			"location_type": "0",
			"stop_access":   "0",
		}
		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"stops": map[string][]int{"S1": {0}}},
			TableData: map[string][]map[string]string{"stops": {stopData}},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.ToStopIdValidation(pathways, 1, gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Test_Valid_Platform_With_Stop_Access_1", types.SEVERITY_ERROR)
	})
	t.Run("Test_Valid_Platform_LocationTypeEmpty", func(t *testing.T) {
		services.AppMessageService.Clear()
		pathways := &types.Pathways{ToStopId: lib.Ptr("S1")}

		stopData := map[string]string{
			"stop_id":       "S1",
			"location_type": "",
			"stop_access":   "",
		}

		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"stops": map[string][]int{"S1": {0}}},
			TableData: map[string][]map[string]string{"stops": {stopData}},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.ToStopIdValidation(pathways, 1, gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Test_Valid_Platform_LocationTypeEmpty", types.SEVERITY_ERROR)
	})
	t.Run("Test_Invalid_Platform_With_Stop_Access_1", func(t *testing.T) {
		services.AppMessageService.Clear()
		pathways := &types.Pathways{ToStopId: lib.Ptr("S1")}
		stopData := map[string]string{
			"stop_id":       "S1",
			"location_type": "",
			"stop_access":   "1",
		}
		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"stops": map[string][]int{"S1": {0}}},
			TableData: map[string][]map[string]string{"stops": {stopData}},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.ToStopIdValidation(pathways, 1, gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Test_Invalid_Platform_With_Stop_Access_1", types.SEVERITY_ERROR)
	})
	t.Run("Test_Invalid_Platform_LocationTypeEmpty", func(t *testing.T) {
		services.AppMessageService.Clear()
		pathways := &types.Pathways{ToStopId: lib.Ptr("S1")}
		stopData := map[string]string{
			"stop_id":       "S1",
			"location_type": "1",
			"stop_access":   "",
		}
		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"stops": map[string][]int{"S1": {0}}},
			TableData: map[string][]map[string]string{"stops": {stopData}},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.ToStopIdValidation(pathways, 1, gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Test_Invalid_Platform_LocationTypeEmpty", types.SEVERITY_ERROR)
	})
}
