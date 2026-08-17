package frequencies_test

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/frequencies/validations"
	"testing"
)

func TestAllTripIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("trip_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			frequency := &types.Frequencies{TripId: tc.Id}
			if tc.Name == "ForeignKey_Invalid" {
				frequency = &types.Frequencies{}
			}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": {*tc.Id: {1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.TripIdValidation(frequency, tc.Row, gtfs, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	t.Run("Required_Missing", func(t *testing.T) {
		services.AppMessageService.Clear()
		frequency := &types.Frequencies{TripId: nil}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": {"trip1": {1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.TripIdValidation(frequency, 1, gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Trip ID is required", types.SEVERITY_ERROR)
	})
	t.Run("Forbidden_Present", func(t *testing.T) {
		services.AppMessageService.Clear()
		frequency := &types.Frequencies{TripId: nil}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": {"trip1": {1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.TripIdValidation(frequency, 1, gtfs, &types.FrequenciesRules{TripId: types.RuleConfig{Severity: types.SEVERITY_FORBIDDEN}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Forbidden_Present", types.SEVERITY_FORBIDDEN)
	})
}
