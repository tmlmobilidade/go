package stops

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stops/validations"
	"testing"
)

func TestAllStopAccessValidationTestCases(t *testing.T) {
	validOptions := []int{0, 1}
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("stop_access", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}

			var stopAccess *int
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok {
					stopAccess = ptr
				}
			}
			stop := &types.Stop{StopAccess: stopAccess, LocationType: lib.Ptr(0), ParentStation: lib.Ptr("1")}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": map[string][]int{"stop_id": {1}, "location_type": {0}, "parent_station": {1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.StopAccessValidation(stop, tc.Row, gtfs, &types.StopsRules{StopAccess: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	t.Run("TestSeverity_Forbidden_parent_station_empty", func(t *testing.T) {
		services.AppMessageService.Clear()
		stop := &types.Stop{StopAccess: lib.Ptr(0), LocationType: lib.Ptr(1), ParentStation: nil}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": map[string][]int{"stop_id": {1}, "location_type": {1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.StopAccessValidation(stop, 1, gtfs, &types.StopsRules{StopAccess: types.RuleConfig{Severity: types.SEVERITY_FORBIDDEN}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "TestSeverity_Forbidden_parent_station_empty", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "TestSeverity_Forbidden_parent_station_empty", types.SEVERITY_WARNING)
	})
	t.Run("TestSeverity_Forbidden_location_type_not_platform", func(t *testing.T) {
		services.AppMessageService.Clear()
		stop := &types.Stop{StopAccess: lib.Ptr(0), LocationType: lib.Ptr(1), ParentStation: lib.Ptr("1")}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": map[string][]int{"stop_id": {1}, "location_type": {1}, "parent_station": {1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.StopAccessValidation(stop, 1, gtfs, &types.StopsRules{StopAccess: types.RuleConfig{Severity: types.SEVERITY_FORBIDDEN}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "TestSeverity_Forbidden_location_type_not_platform", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "TestSeverity_Forbidden_location_type_not_platform", types.SEVERITY_WARNING)
	})
	t.Run("TestSeverity_Ignore", func(t *testing.T) {
		services.AppMessageService.Clear()
		stop := &types.Stop{StopAccess: lib.Ptr(0), LocationType: lib.Ptr(0), ParentStation: lib.Ptr("1")}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": map[string][]int{"stop_id": {1}, "location_type": {0}, "parent_station": {1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.StopAccessValidation(stop, 1, gtfs, &types.StopsRules{StopAccess: types.RuleConfig{Severity: types.SEVERITY_IGNORE}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "TestSeverity_Ignore", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "TestSeverity_Ignore", types.SEVERITY_WARNING)
	})
}
