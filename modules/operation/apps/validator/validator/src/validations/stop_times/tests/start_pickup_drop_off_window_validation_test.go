package stop_times

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stop_times/validations"
	"testing"
)

func TestAllStartPickupDropOffWindowValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetValidTimeOptions()
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("start_pickup_drop_off_window") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var startPickupDropOffWindow *string
			if tc.Name == "Invalid_Value" {
				startPickupDropOffWindow = lib.Ptr("")
			} else if tc.Value != nil {
				startPickupDropOffWindow = &validOptions[0]
			} else {
				startPickupDropOffWindow = nil
			}

			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}

			rules := &types.StopTimesRules{StartPickupDropOffWindow: types.RuleConfig{Severity: severity}}
			if tc.Name == "Invalid_Value" {
				stopTime := &types.StopTime{}
				validations.StartPickupDropOffWindowValidation(stopTime, tc.Row, rules)
			} else {
				stopTime := &types.StopTime{StartPickupDropOffWindow: startPickupDropOffWindow}
				validations.StartPickupDropOffWindowValidation(stopTime, tc.Row, rules)
			}
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	t.Run("Required_LocationGroupId", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.StartPickupDropOffWindowValidation(&types.StopTime{LocationGroupId: lib.Ptr("LG1")}, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Required_LocationGroupId", types.SEVERITY_ERROR)
	})
	t.Run("Required_LocationId", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.StartPickupDropOffWindowValidation(&types.StopTime{LocationId: lib.Ptr("L1")}, 2, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Required_LocationId", types.SEVERITY_ERROR)
	})
	t.Run("Required_EndPickupDropOffWindow", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.StartPickupDropOffWindowValidation(&types.StopTime{EndPickupDropOffWindow: lib.Ptr("10:00:00")}, 3, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Required_EndPickupDropOffWindow", types.SEVERITY_ERROR)
	})
	t.Run("Forbidden_ArrivalTime", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.StartPickupDropOffWindowValidation(&types.StopTime{ArrivalTime: lib.Ptr("08:00:00"), StartPickupDropOffWindow: lib.Ptr("10:00:00")}, 4, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_ArrivalTime", types.SEVERITY_ERROR)
	})
	t.Run("Forbidden_DepartureTime", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.StartPickupDropOffWindowValidation(&types.StopTime{DepartureTime: lib.Ptr("09:00:00"), StartPickupDropOffWindow: lib.Ptr("10:00:00")}, 5, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_DepartureTime", types.SEVERITY_ERROR)
	})
}
