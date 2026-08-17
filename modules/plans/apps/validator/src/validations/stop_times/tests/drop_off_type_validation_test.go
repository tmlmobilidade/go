package stop_times

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stop_times/validations"
	"testing"
)

func TestAllDropOffTypeValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetFourStateValidOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("drop_off_type", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var dropOffType *int
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok {
					dropOffType = ptr
				}
			}

			var rules *types.StopTimesRules
			var severity types.Severity
			if tc.Name == "Missing_Value_Required" {
				severity = types.SEVERITY_ERROR
			} else if tc.Row == 2 {
				severity = types.SEVERITY_WARNING
			}
			rules = &types.StopTimesRules{DropOffType: types.RuleConfig{Severity: severity}}

			stopTime := &types.StopTime{DropOffType: dropOffType}
			validations.DropOffTypeValidation(stopTime, tc.Row, rules)
			expectedTotalMessages := tc.ExpectedErrors + tc.ExpectedWarnings
			test_helpers.AssertMessageCount(t, services.AppMessageService, expectedTotalMessages, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	t.Run("Forbidden_WithStartWindow", func(t *testing.T) {
		services.AppMessageService.Clear()
		val := 0
		startWindow := "07:00:00"
		stopTime := &types.StopTime{DropOffType: &val, StartPickupDropOffWindow: &startWindow}
		validations.DropOffTypeValidation(stopTime, 3, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_WithStartWindow", types.SEVERITY_ERROR)
	})
	t.Run("Forbidden_WithEndWindow", func(t *testing.T) {
		services.AppMessageService.Clear()
		val := 0
		endWindow := "10:00:00"
		stopTime := &types.StopTime{DropOffType: &val, EndPickupDropOffWindow: &endWindow}
		validations.DropOffTypeValidation(stopTime, 4, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_WithEndWindow", types.SEVERITY_ERROR)
	})
}
