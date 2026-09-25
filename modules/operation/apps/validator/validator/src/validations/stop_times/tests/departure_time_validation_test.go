package stop_times

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stop_times/validations"
	"testing"
)

func TestAllDepartureTimeValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetValidTimeOptions()
	invalidOptions := lib.Ptr("") //test_helpers.GetInvalidTimeOptions() because dont verify invalid time for value all time is valid
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("departure_time") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var departureTime *string
			if tc.Name == "Invalid_Value" {
				departureTime = invalidOptions
			} else if tc.Value != nil {
				departureTime = &validOptions[0]
			} else {
				departureTime = nil
			}

			var rules *types.StopTimesRules
			if tc.ExpectedWarnings > 0 {
				rules = &types.StopTimesRules{DepartureTime: types.RuleConfig{Severity: types.SEVERITY_WARNING}}
			} else {
				rules = &types.StopTimesRules{DepartureTime: types.RuleConfig{Severity: types.SEVERITY_ERROR}}
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stop_times": map[string][]int{"trip_id": []int{1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.DepartureTimeValidation(&types.StopTime{DepartureTime: departureTime}, tc.Row, gtfs, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	t.Run("Required_Timepoint1", func(t *testing.T) {
		services.AppMessageService.Clear()
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stop_times": map[string][]int{"trip_id": []int{1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.DepartureTimeValidation(&types.StopTime{DepartureTime: nil, Timepoint: lib.Ptr(1)}, 1, gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Missing departure_time for timepoint=1 should error", types.SEVERITY_ERROR)
	})

	t.Run("Forbidden_WithStartWindow", func(t *testing.T) {
		services.AppMessageService.Clear()
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stop_times": map[string][]int{"trip_id": []int{1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.DepartureTimeValidation(&types.StopTime{DepartureTime: lib.Ptr("07:00:00"), StartPickupDropOffWindow: lib.Ptr("07:00:00")}, 3, gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_WithStartWindow", types.SEVERITY_ERROR)
	})

	t.Run("Forbidden_WithEndWindow", func(t *testing.T) {
		services.AppMessageService.Clear()
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stop_times": map[string][]int{"trip_id": []int{1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.DepartureTimeValidation(&types.StopTime{DepartureTime: lib.Ptr("07:00:00"), EndPickupDropOffWindow: lib.Ptr("07:00:00")}, 3, gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_WithEndWindow", types.SEVERITY_ERROR)
	})

}
