package stops

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stops/validations"
	"testing"
)

func TestAllStopIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericIdTestCases("stop_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var stopId *string
			if tc.Id != nil {
				stopId = tc.Id
			}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": {}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			if tc.ExistingIds != nil {
				gtfs, cleanup, err = test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": tc.ExistingIds}}.ToGtfsWithDB()
				if err != nil {
					t.Fatalf("failed to create mock gtfs: %v", err)
				}
				defer cleanup()
			}
			stop := &types.Stop{StopId: stopId}
			validations.StopIdValidation(stop, tc.Row, gtfs, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("stop_id") {
		if tc.Name == "Severity_Warning_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			stop := &types.Stop{StopId: nil}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": {}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.StopIdValidation(stop, tc.Row, gtfs, &types.StopsRules{StopId: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, tc.Severity)
		})
	}

	t.Run("EmptyStopId", func(t *testing.T) {
		services.AppMessageService.Clear()
		empty := ""
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": {}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		stop := &types.Stop{StopId: &empty}
		validations.StopIdValidation(stop, 1, gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "EmptyStopId", types.SEVERITY_ERROR)
	})

	// t.Run("InvalidStopIdAgainstPrecomputedValidIds", func(t *testing.T) {
	// 	services.AppMessageService.Clear()
	// 	stopID := "999999"
	// 	gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": {"999999": {1}}}}.ToGtfsWithDB()
	// 	if err != nil {
	// 		t.Fatalf("failed to create mock gtfs: %v", err)
	// 	}
	// 	defer cleanup()

	// 	stop := &types.Stop{StopId: &stopID}
	// 	validations.StopIdValidation(stop, 1, gtfs, &types.StopsRules{
	// 		StopIdExists: types.RuleConfig{Severity: types.SEVERITY_ERROR},
	// 	}, &types.StopsDataCache{
	// 		ValidStopIDs: map[string]struct{}{"010129": {}},
	// 	})
	// 	test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "InvalidStopIdAgainstPrecomputedValidIds", types.SEVERITY_ERROR)
	// })

	// t.Run("InternalIdNotValidAsStopId", func(t *testing.T) {
	// 	services.AppMessageService.Clear()
	// 	internalID := "760509"
	// 	gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": {"760509": {1}}}}.ToGtfsWithDB()
	// 	if err != nil {
	// 		t.Fatalf("failed to create mock gtfs: %v", err)
	// 	}
	// 	defer cleanup()

	// 	stop := &types.Stop{StopId: &internalID}
	// 	validations.StopIdValidation(stop, 1, gtfs, &types.StopsRules{
	// 		StopIdExists: types.RuleConfig{Severity: types.SEVERITY_ERROR},
	// 	}, &types.StopsDataCache{
	// 		ValidStopIDs: map[string]struct{}{"010129": {}},
	// 	})
	// 	test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "InternalIdNotValidAsStopId", types.SEVERITY_ERROR)
	// })
}
