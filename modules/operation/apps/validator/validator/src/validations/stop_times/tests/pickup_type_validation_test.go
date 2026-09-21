package stop_times

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stop_times/validations"
	"testing"
)

func TestAllPickupTypeValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetFourStateValidOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("pickup_type", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var pickupType *int
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok {
					pickupType = ptr
				}
			}

			var rules *types.StopTimesRules
			if tc.Name == "Missing_Value_Required" {
				rules = &types.StopTimesRules{PickupType: types.RuleConfig{Severity: types.SEVERITY_ERROR}}
			} else if tc.Row == 2 {
				rules = &types.StopTimesRules{PickupType: types.RuleConfig{Severity: types.SEVERITY_WARNING}}
			}

			stopTime := &types.StopTime{PickupType: pickupType}
			validations.PickupTypeValidation(stopTime, tc.Row, rules)
			expectedTotalMessages := tc.ExpectedErrors + tc.ExpectedWarnings
			test_helpers.AssertMessageCount(t, services.AppMessageService, expectedTotalMessages, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	t.Run("Forbidden_WithStartWindow", func(t *testing.T) {
		services.AppMessageService.Clear()
		pt := 0
		startWindow := "07:00:00"
		stopTime := &types.StopTime{PickupType: &pt, StartPickupDropOffWindow: &startWindow}
		validations.PickupTypeValidation(stopTime, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_WithStartWindow", types.SEVERITY_ERROR)
	})
	t.Run("Forbidden_WithEndWindow", func(t *testing.T) {
		services.AppMessageService.Clear()
		pt := 3
		endWindow := "10:00:00"
		stopTime := &types.StopTime{PickupType: &pt, EndPickupDropOffWindow: &endWindow}
		validations.PickupTypeValidation(stopTime, 2, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_WithEndWindow", types.SEVERITY_ERROR)
	})

	t.Run("Allowed_WithStartWindowIfOne", func(t *testing.T) {
		services.AppMessageService.Clear()
		pt := 1
		startWindow := "07:00:00"
		stopTime := &types.StopTime{PickupType: &pt, StartPickupDropOffWindow: &startWindow}
		validations.PickupTypeValidation(stopTime, 3, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Allowed_WithStartWindowIfOne", types.SEVERITY_ERROR)
	})
	t.Run("Allowed_WithEndWindowIfOne", func(t *testing.T) {
		services.AppMessageService.Clear()
		pt := 1
		endWindow := "10:00:00"
		stopTime := &types.StopTime{PickupType: &pt, EndPickupDropOffWindow: &endWindow}
		validations.PickupTypeValidation(stopTime, 4, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Allowed_WithEndWindowIfOne", types.SEVERITY_ERROR)
	})
}
