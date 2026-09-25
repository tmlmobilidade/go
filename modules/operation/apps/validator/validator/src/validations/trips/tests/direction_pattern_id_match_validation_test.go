package trips

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/trips/validations"
	"testing"
)

func TestAllDirectionPatternIdMatchValidationTestCases(t *testing.T) {
	directionIdValidOptions := test_helpers.GetBinaryValidOptions()
	patternIdValidOptions := []string{"1001_0_1", "1001_1_2"}
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("direction_id", directionIdValidOptions) {
		// For valid option test cases, only test with matching pattern_id
		// For other test cases, test with all pattern_ids
		var patternIdsToTest []string
		if tc.Name == "Valid_Option_0" {
			patternIdsToTest = []string{"1001_0_1"}
		} else if tc.Name == "Valid_Option_1" {
			patternIdsToTest = []string{"1001_1_2"}
		} else {
			patternIdsToTest = patternIdValidOptions
		}

		for _, patternId := range patternIdsToTest {
			t.Run(tc.Name+"_"+patternId, func(t *testing.T) {
				services.AppMessageService.Clear()

				var severity types.Severity
				if tc.ExpectedWarnings > 0 {
					severity = types.SEVERITY_WARNING
				} else {
					severity = types.SEVERITY_ERROR
				}

				var directionId *int
				if tc.Value != nil {
					if ptr, ok := tc.Value.(*int); ok {
						directionId = ptr
					} else {
						directionId = nil
					}
				}
				trip := &types.Trip{PatternId: &patternId, DirectionId: directionId}
				if tc.Name == "Invalid_Value" {
					trip = &types.Trip{}
				}

				gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"routes": {"MY_ROUTE_ID": []int{1}}}}.ToGtfsWithDB()
				if err != nil {
					t.Fatalf("failed to create mock gtfs: %v", err)
				}
				defer cleanup()

				validations.DirectionPatternIdMatchValidation(trip, tc.Row, gtfs, &types.TripsRules{DirectionPatternIdMatch: types.RuleConfig{Severity: severity}})
				test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
				test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
			})
		}
	}

	for _, tc := range test_helpers.GetGenericSeverityTestCases("direction_pattern_id_match") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			trip := &types.Trip{DirectionId: nil}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"routes": {"MY_ROUTE_ID": []int{1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.DirectionPatternIdMatchValidation(trip, tc.Row, gtfs, &types.TripsRules{DirectionPatternIdMatch: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	t.Run("Invalid_Pattern_Id", func(t *testing.T) {
		services.AppMessageService.Clear()
		trip := &types.Trip{PatternId: lib.Ptr("1001_2_1"), DirectionId: lib.Ptr(0)}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"routes": {"MY_ROUTE_ID": []int{1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.DirectionPatternIdMatchValidation(trip, 1, gtfs, &types.TripsRules{DirectionPatternIdMatch: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_Pattern_Id", types.SEVERITY_ERROR)
	})

	t.Run("Invalid_Direction_Id", func(t *testing.T) {
		services.AppMessageService.Clear()
		trip := &types.Trip{PatternId: lib.Ptr("1001_0_1"), DirectionId: lib.Ptr(2)}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"routes": {"MY_ROUTE_ID": []int{1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.DirectionPatternIdMatchValidation(trip, 1, gtfs, &types.TripsRules{DirectionPatternIdMatch: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_Direction_Id", types.SEVERITY_ERROR)
	})

	t.Run("Not_Matching_Direction_Id", func(t *testing.T) {
		services.AppMessageService.Clear()
		trip := &types.Trip{PatternId: lib.Ptr("1001_0_1"), DirectionId: lib.Ptr(1)}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"routes": {"MY_ROUTE_ID": []int{1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.DirectionPatternIdMatchValidation(trip, 1, gtfs, &types.TripsRules{DirectionPatternIdMatch: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Not_Matching_Direction_Id", types.SEVERITY_ERROR)
	})

	t.Run("Not_Matching_Direction_Id", func(t *testing.T) {
		services.AppMessageService.Clear()
		trip := &types.Trip{PatternId: lib.Ptr("1001_1_2"), DirectionId: lib.Ptr(0)}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"routes": {"MY_ROUTE_ID": []int{1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.DirectionPatternIdMatchValidation(trip, 1, gtfs, &types.TripsRules{DirectionPatternIdMatch: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Not_Matching_Direction_Id", types.SEVERITY_ERROR)
	})
}
