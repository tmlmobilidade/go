package stop_times

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stop_times/validations"
	"testing"
)

func TestAllArrivalTimeValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetValidTimeOptions()
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("arrival_time") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var arrivalTime *string
			if tc.Name == "Invalid_Value" {
				arrivalTime = lib.Ptr("")
			} else if tc.Value != nil {
				arrivalTime = &validOptions[0]
			} else {
				arrivalTime = nil
			}

			var rules *types.StopTimesRules
			if tc.ExpectedWarnings > 0 {
				rules = &types.StopTimesRules{ArrivalTime: types.RuleConfig{Severity: types.SEVERITY_WARNING}}
			} else {
				rules = &types.StopTimesRules{ArrivalTime: types.RuleConfig{Severity: types.SEVERITY_ERROR}}
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stop_times": map[string][]int{"trip_id": []int{1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			validations.ArrivalTimeValidation(&types.StopTime{ArrivalTime: arrivalTime}, tc.Row, gtfs, rules, make(map[string]types.TripStopSequence))
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("arrival_time") {
		if tc.Name == "Severity_Forbidden_Missing" { // because forbidden is present but its right to be present
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stop_times": map[string][]int{"trip_id": []int{1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.ArrivalTimeValidation(&types.StopTime{}, tc.Row, gtfs, &types.StopTimesRules{ArrivalTime: types.RuleConfig{Severity: tc.Severity}}, make(map[string]types.TripStopSequence))
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
		validations.ArrivalTimeValidation(&types.StopTime{Timepoint: lib.Ptr(1)}, 1, gtfs, nil, make(map[string]types.TripStopSequence))
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Required_Timepoint1", types.SEVERITY_ERROR)
	})
	t.Run("Required_FirstStop", func(t *testing.T) {
		services.AppMessageService.Clear()
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stop_times": map[string][]int{"trip_id": []int{1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.ArrivalTimeValidation(&types.StopTime{StopSequence: lib.Ptr(1), TripId: lib.Ptr("trip1")}, 1, gtfs, nil, make(map[string]types.TripStopSequence))
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Required_FirstStop", types.SEVERITY_ERROR)
	})
	t.Run("Required_LastStop", func(t *testing.T) {
		services.AppMessageService.Clear()
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stop_times": map[string][]int{"trip_id": []int{1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.ArrivalTimeValidation(&types.StopTime{StopSequence: lib.Ptr(5), TripId: lib.Ptr("trip1")}, 1, gtfs, nil, make(map[string]types.TripStopSequence))
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Required_LastStop", types.SEVERITY_ERROR)
	})
	t.Run("Forbidden_WithStartWindow", func(t *testing.T) {
		services.AppMessageService.Clear()
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stop_times": map[string][]int{"trip_id": []int{1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.ArrivalTimeValidation(&types.StopTime{ArrivalTime: lib.Ptr("07:00:00"), StartPickupDropOffWindow: lib.Ptr("07:00:00")}, 3, gtfs, nil, make(map[string]types.TripStopSequence))
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_WithStartWindow", types.SEVERITY_ERROR)
	})
	t.Run("Forbidden_WithEndWindow", func(t *testing.T) {
		services.AppMessageService.Clear()
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stop_times": map[string][]int{"trip_id": []int{1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.ArrivalTimeValidation(&types.StopTime{ArrivalTime: lib.Ptr("10:00:00"), EndPickupDropOffWindow: lib.Ptr("10:00:00")}, 4, gtfs, nil, make(map[string]types.TripStopSequence))
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_WithEndWindow", types.SEVERITY_ERROR)
	})
}
