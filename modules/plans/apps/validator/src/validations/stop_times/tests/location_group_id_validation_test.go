package stop_times

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stop_times/validations"
	"testing"
)

func TestAllLocationGroupIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("location_group_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var stopTime *types.StopTime
			if tc.Id != nil {
				stopTime = &types.StopTime{LocationGroupId: tc.Id}
			} else {
				stopTime = &types.StopTime{}
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"location_groups": {*tc.Id: {1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			if tc.Name == "ForeignKey_Invalid" {
				gtfs, cleanup, err = test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"location_groups": {}}}.ToGtfsWithDB()
				if err != nil {
					t.Fatalf("failed to create mock gtfs: %v", err)
				}
				defer cleanup()
			}
			validations.LocationGroupIdValidation(stopTime, tc.Row, gtfs)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("location_group_id") {
		if tc.Name != "Severity_Ignore_Missing" && tc.Name != "Severity_Forbidden_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"location_groups": {}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.LocationGroupIdValidation(&types.StopTime{}, tc.Row, gtfs)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}

	t.Run("Missing_BookingRulesIndex", func(t *testing.T) {
		services.AppMessageService.Clear()
		stopTime := &types.StopTime{LocationGroupId: lib.Ptr("LG1")}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"location_groups": {"LG1": {1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.LocationGroupIdValidation(stopTime, 1, gtfs)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Missing_LocationGroupsIndex", types.SEVERITY_ERROR)
	})
}
