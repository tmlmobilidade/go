package stops

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stops/validations"
	"testing"
)

func TestAllParentStationValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("parent_station") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var parentStation *string
			if tc.Id != nil {
				parentStation = tc.Id
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": {*parentStation: {1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			if tc.Name == "ForeignKey_Invalid" {
				gtfs, cleanup, err = test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": {*parentStation: {}}}}.ToGtfsWithDB()
				if err != nil {
					t.Fatalf("failed to create mock gtfs: %v", err)
				}
				defer cleanup()
			}
			stop := &types.Stop{ParentStation: parentStation}
			validations.ParentStationValidation(stop, tc.Row, *gtfs, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("parent_station") {
		if tc.Name == "Severity_Forbidden_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			stop := &types.Stop{ParentStation: nil, LocationType: lib.Ptr(0)}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": {}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.ParentStationValidation(stop, tc.Row, *gtfs, &types.StopsRules{ParentStation: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	t.Run("TestLocationType2", func(t *testing.T) {
		services.AppMessageService.Clear()
		stop := &types.Stop{LocationType: lib.Ptr(2), ParentStation: nil}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": {}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.ParentStationValidation(stop, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "TestLocationType2", types.SEVERITY_ERROR)
	})

	t.Run("TestLocationType3", func(t *testing.T) {
		services.AppMessageService.Clear()
		stop := &types.Stop{LocationType: lib.Ptr(3), ParentStation: nil}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": {}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.ParentStationValidation(stop, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "TestLocationType3", types.SEVERITY_ERROR)
	})

	t.Run("TestLocationType4", func(t *testing.T) {
		services.AppMessageService.Clear()
		stop := &types.Stop{LocationType: lib.Ptr(4), ParentStation: nil}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": {}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.ParentStationValidation(stop, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "TestLocationType4", types.SEVERITY_ERROR)
	})

	t.Run("TestLocationType1_WithParentStation_ShouldError", func(t *testing.T) {
		services.AppMessageService.Clear()
		parentStation := "STATION1"
		stop := &types.Stop{LocationType: lib.Ptr(1), ParentStation: &parentStation}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": {parentStation: {1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.ParentStationValidation(stop, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "TestLocationType1_WithParentStation_ShouldError", types.SEVERITY_ERROR)
	})

	t.Run("TestLocationType0_WithParentStation_ValidForeignKey", func(t *testing.T) {
		services.AppMessageService.Clear()
		parentStation := "STATION1"
		stop := &types.Stop{LocationType: lib.Ptr(0), ParentStation: &parentStation}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": {parentStation: {1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.ParentStationValidation(stop, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "TestLocationType0_WithParentStation_ValidForeignKey", types.SEVERITY_ERROR)
	})

	t.Run("TestLocationType2_WithValidParentStation", func(t *testing.T) {
		services.AppMessageService.Clear()
		parentStation := "STATION1"
		stop := &types.Stop{LocationType: lib.Ptr(2), ParentStation: &parentStation}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": {parentStation: {1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.ParentStationValidation(stop, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "TestLocationType2_WithValidParentStation", types.SEVERITY_ERROR)
	})
}
