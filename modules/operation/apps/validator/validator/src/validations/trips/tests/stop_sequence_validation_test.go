package trips

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/trips/validations"
	"testing"
)

func TestAllStopSequenceValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("stop_sequence") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			trip := &types.Trip{TripId: lib.Ptr("T16")}
			stopTimes := []types.StopTimeRaw{
				{TripId: "T16", StopSequence: "1", StopId: "S1"},
				{TripId: "T16", StopSequence: "2", StopId: "S2"},
				{TripId: "T16", StopSequence: "3", StopId: "S3"},
			}
			if tc.Name == "Invalid_Value" {
				stopTimes[1].StopSequence = ""
			}

			if tc.Name == "Required" || tc.Name == "Recommended_Missing" {
				stopTimes[0].StopSequence = ""
			}

			tripStopTimesCache := map[string][]types.StopTimeRaw{
				"T16": stopTimes,
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": {"T16": {1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.StopSequenceValidation(trip, tc.Row, gtfs, &types.TripsRules{StopSequence: types.RuleConfig{Severity: types.SEVERITY_ERROR}}, tripStopTimesCache)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("stop_sequence") {
		if tc.Name == "Severity_Error_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			trip := &types.Trip{TripId: lib.Ptr("T16")}
			validations.StopSequenceValidation(trip, tc.Row, &types.Gtfs{}, &types.TripsRules{StopSequence: types.RuleConfig{Severity: tc.Severity}}, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, tc.Severity)
		})
	}
	t.Run("DefaultSeverity", func(t *testing.T) {
		services.AppMessageService.Clear()
		trip := &types.Trip{TripId: lib.Ptr("T16")}
		validations.StopSequenceValidation(trip, 1, &types.Gtfs{}, &types.TripsRules{StopSequence: types.RuleConfig{Severity: types.SEVERITY_ERROR}}, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "DefaultSeverity", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "DefaultSeverity", types.SEVERITY_WARNING)
	})
	t.Run("OrderedByStopSequence_Invalid", func(t *testing.T) {
		services.AppMessageService.Clear()
		trip := &types.Trip{TripId: lib.Ptr("T16")}
		validations.StopSequenceValidation(trip, 1, &types.Gtfs{}, &types.TripsRules{StopSequence: types.RuleConfig{Severity: types.SEVERITY_ERROR}}, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "OrderedByStopSequence_Invalid", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "OrderedByStopSequence_Invalid", types.SEVERITY_WARNING)
	})
	t.Run("OrderedByStopSequence_Valid", func(t *testing.T) {
		services.AppMessageService.Clear()
		trip := &types.Trip{TripId: lib.Ptr("T16")}
		validations.StopSequenceValidation(trip, 1, &types.Gtfs{}, &types.TripsRules{StopSequence: types.RuleConfig{Severity: types.SEVERITY_ERROR}}, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "OrderedByStopSequence_Valid", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "OrderedByStopSequence_Valid", types.SEVERITY_WARNING)
	})
	t.Run("DefaultSeverity_OrderedByStopSequence_Invalid", func(t *testing.T) {
		services.AppMessageService.Clear()
		trip := &types.Trip{TripId: lib.Ptr("T16")}
		validations.StopSequenceValidation(trip, 1, &types.Gtfs{}, &types.TripsRules{StopSequence: types.RuleConfig{Severity: types.SEVERITY_ERROR}}, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "DefaultSeverity_OrderedByStopSequence_Invalid", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "DefaultSeverity_OrderedByStopSequence_Invalid", types.SEVERITY_WARNING)
	})
	t.Run("DefaultSeverity_OrderedByStopSequence_Valid", func(t *testing.T) {
		services.AppMessageService.Clear()
		trip := &types.Trip{TripId: lib.Ptr("T16")}
		validations.StopSequenceValidation(trip, 1, &types.Gtfs{}, &types.TripsRules{StopSequence: types.RuleConfig{Severity: types.SEVERITY_ERROR}}, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "DefaultSeverity_OrderedByStopSequence_Valid", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "DefaultSeverity_OrderedByStopSequence_Valid", types.SEVERITY_WARNING)
	})
}
