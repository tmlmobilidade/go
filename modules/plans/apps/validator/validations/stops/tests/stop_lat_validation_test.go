package stops

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stops/validations"
	"testing"
)

func TestAllStopLatValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetFloat32ValidOptions()
	invalidOption := float32(200.0) // out of range

	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("stop_lat") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			stop := &types.Stop{StopLat: lib.Ptr(validOptions[0]), LocationType: lib.Ptr(0)}
			if tc.Name == "Invalid_Value" {
				stop = &types.Stop{StopLat: &invalidOption, LocationType: lib.Ptr(0)}
			}
			if tc.Name == "Required" {
				stop = &types.Stop{StopLat: nil, LocationType: lib.Ptr(0)}
			}
			validations.StopLatValidation(stop, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}

	for _, tc := range test_helpers.GetGenericSeverityTestCases("stop_lat") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			stop := &types.Stop{StopLat: nil}
			validations.StopLatValidation(stop, tc.Row, &types.StopsRules{StopLat: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	t.Run("DefaultSeverity", func(t *testing.T) {
		services.AppMessageService.Clear()
		stop := &types.Stop{StopLat: nil, LocationType: lib.Ptr(4)}
		validations.StopLatValidation(stop, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "DefaultSeverity", types.SEVERITY_ERROR)
	})

	t.Run("LocationType_0", func(t *testing.T) {
		services.AppMessageService.Clear()
		stop := &types.Stop{StopLat: nil, LocationType: lib.Ptr(0)}
		validations.StopLatValidation(stop, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "LocationType_0", types.SEVERITY_ERROR)
	})
	t.Run("LocationType_1", func(t *testing.T) {
		services.AppMessageService.Clear()
		stop := &types.Stop{StopLat: nil, LocationType: lib.Ptr(1)}
		validations.StopLatValidation(stop, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "LocationType_1", types.SEVERITY_ERROR)
	})
	t.Run("LocationType_2", func(t *testing.T) {
		services.AppMessageService.Clear()
		stop := &types.Stop{StopLat: nil, LocationType: lib.Ptr(2)}
		validations.StopLatValidation(stop, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "LocationType_2", types.SEVERITY_ERROR)
	})
	t.Run("LocationType_3", func(t *testing.T) {
		services.AppMessageService.Clear()
		stop := &types.Stop{StopLat: nil, LocationType: lib.Ptr(3)}
		validations.StopLatValidation(stop, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "LocationType_3", types.SEVERITY_ERROR)
	})
	t.Run("LocationType_4", func(t *testing.T) {
		services.AppMessageService.Clear()
		stop := &types.Stop{StopLat: nil, LocationType: lib.Ptr(4)}
		validations.StopLatValidation(stop, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "LocationType_4", types.SEVERITY_ERROR)
	})
}
