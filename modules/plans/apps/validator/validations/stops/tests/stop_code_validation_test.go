package stops

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stops/validations"
	"testing"
)

func TestAllStopCodeValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("stop_code") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			stop := &types.Stop{StopCode: tc.Value}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": {}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			if tc.Value != nil {
				gtfs, cleanup, err = test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": {*tc.Value: {tc.Row}}}}.ToGtfsWithDB()
				if err != nil {
					t.Fatalf("failed to create mock gtfs: %v", err)
				}
				defer cleanup()
			}

			if tc.Name == "Invalid_Value" {
				gtfs, cleanup, err = test_helpers.MockGtfs{}.ToGtfsWithDB()
				if err != nil {
					t.Fatalf("failed to create mock gtfs: %v", err)
				}
				defer cleanup()
			}

			var severity types.Severity
			if tc.ExpectedErrors > 0 {
				severity = types.SEVERITY_ERROR
			} else {
				severity = types.SEVERITY_WARNING
			}

			validations.StopCodeValidation(stop, tc.Row, gtfs, &types.StopsRules{StopCode: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("stop_code") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			stop := &types.Stop{StopCode: nil}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": {}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.StopCodeValidation(stop, tc.Row, gtfs, &types.StopsRules{StopCode: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	t.Run("DefaultSeverity", func(t *testing.T) {
		services.AppMessageService.Clear()
		stop := &types.Stop{StopCode: nil}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": {}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.StopCodeValidation(stop, 1, gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "DefaultSeverity", types.SEVERITY_ERROR)
	})
}
