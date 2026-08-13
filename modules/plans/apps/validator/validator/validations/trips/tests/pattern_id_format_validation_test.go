package trips

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/trips/validations"
	"testing"
)

func TestAllPatternIdFormatValidationTestCases(t *testing.T) {
	t.Run("Valid Pattern ID", func(t *testing.T) {
		services.AppMessageService.Clear()
		trip := &types.Trip{PatternId: lib.Ptr("1001_0_6")}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": {"1001_0_1": []int{1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.PatternIdFormatValidation(trip, 1, gtfs, &types.TripsRules{PatternIdFormat: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid Pattern ID", types.SEVERITY_ERROR)
	})
	t.Run("Invalid Pattern ID", func(t *testing.T) {
		services.AppMessageService.Clear()
		trip := &types.Trip{PatternId: lib.Ptr("1001_0_1_1_1")}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": {"1001_0_1_1": []int{1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.PatternIdFormatValidation(trip, 1, gtfs, &types.TripsRules{PatternIdFormat: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid Pattern ID", types.SEVERITY_ERROR)
	})
	t.Run("Nil_Pattern_ID", func(t *testing.T) {
		services.AppMessageService.Clear()
		trip := &types.Trip{PatternId: nil}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": {"1001_0_1_1": []int{1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.PatternIdFormatValidation(trip, 1, gtfs, &types.TripsRules{PatternIdFormat: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Required_Missing", types.SEVERITY_ERROR)
	})

	t.Run("Valid Pattern ID For Multi Format Rules", func(t *testing.T) {
		services.AppMessageService.Clear()
		trip := &types.Trip{PatternId: lib.Ptr("1001_0_ASC")}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": {"1001_0_ASC": []int{1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.PatternIdFormatValidation(trip, 1, gtfs, &types.TripsRules{
			PatternIdFormat: types.RuleConfig{
				Severity: types.SEVERITY_ERROR,
				Options:  lib.Ptr([]string{"^[^_]{1,4}_[^_]_ASC$", "^[^_]{1,4}_[^_]_DESC$"}),
			},
		})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid Pattern ID For Multi Format Rules", types.SEVERITY_ERROR)
	})

	t.Run("Invalid Pattern ID For Multi Format Rules", func(t *testing.T) {
		services.AppMessageService.Clear()
		trip := &types.Trip{PatternId: lib.Ptr("1001_0_6")}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": {"1001_0_6": []int{1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.PatternIdFormatValidation(trip, 1, gtfs, &types.TripsRules{
			PatternIdFormat: types.RuleConfig{
				Severity: types.SEVERITY_ERROR,
				Options:  lib.Ptr([]string{"^[^_]{1,4}_[^_]_ASC$", "^[^_]{1,4}_[^_]_DESC$"}),
			},
		})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid Pattern ID For Multi Format Rules", types.SEVERITY_ERROR)
	})
}
