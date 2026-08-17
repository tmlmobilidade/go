package stop_times

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stop_times/validations"
	"testing"
)

func TestAllEndPickupDropOffWindowValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetValidTimeOptions()
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("end_pickup_drop_off_window") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var endPickupDropOffWindow *string
			if tc.Name == "Invalid_Value" {
				endPickupDropOffWindow = lib.Ptr("")
			} else if tc.Value != nil {
				endPickupDropOffWindow = &validOptions[0]
			} else {
				endPickupDropOffWindow = nil
			}

			var rules *types.StopTimesRules
			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}
			rules = &types.StopTimesRules{EndPickupDropOffWindow: types.RuleConfig{Severity: severity}}
			if tc.Name == "Invalid_Value" {
				stopTime := &types.StopTime{}
				validations.EndPickupDropOffWindowValidation(stopTime, tc.Row, rules)
			} else {
				stopTime := &types.StopTime{EndPickupDropOffWindow: endPickupDropOffWindow}
				validations.EndPickupDropOffWindowValidation(stopTime, tc.Row, rules)
			}

			if tc.Name == "Recommended_Missing" {
				test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
			} else {
				test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			}
		})
	}

	t.Run("Forbidden_ArrivalTime", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.EndPickupDropOffWindowValidation(&types.StopTime{ArrivalTime: lib.Ptr("08:00:00"), EndPickupDropOffWindow: lib.Ptr("10:00:00")}, 4, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_ArrivalTime", types.SEVERITY_ERROR)
	})
	t.Run("Forbidden_DepartureTime", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.EndPickupDropOffWindowValidation(&types.StopTime{DepartureTime: lib.Ptr("09:00:00"), EndPickupDropOffWindow: lib.Ptr("10:00:00")}, 5, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_DepartureTime", types.SEVERITY_ERROR)
	})

	t.Run("Required_LocationGroupId", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.EndPickupDropOffWindowValidation(&types.StopTime{LocationGroupId: lib.Ptr("LG1")}, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Required_LocationGroupId", types.SEVERITY_ERROR)
	})
	t.Run("Required_LocationId", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.EndPickupDropOffWindowValidation(&types.StopTime{LocationId: lib.Ptr("L1")}, 2, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Required_LocationId", types.SEVERITY_ERROR)
	})

	t.Run("Required_StartPickupDropOffWindow", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.EndPickupDropOffWindowValidation(&types.StopTime{StartPickupDropOffWindow: lib.Ptr("07:00:00")}, 3, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Required_StartPickupDropOffWindow", types.SEVERITY_ERROR)
	})
	t.Run("Forbidden_ArrivalTime", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.EndPickupDropOffWindowValidation(&types.StopTime{ArrivalTime: lib.Ptr("08:00:00"), EndPickupDropOffWindow: lib.Ptr("10:00:00")}, 4, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_ArrivalTime", types.SEVERITY_ERROR)
	})
	t.Run("Forbidden_DepartureTime", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.EndPickupDropOffWindowValidation(&types.StopTime{DepartureTime: lib.Ptr("09:00:00"), EndPickupDropOffWindow: lib.Ptr("10:00:00")}, 5, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_DepartureTime", types.SEVERITY_ERROR)
	})
}
