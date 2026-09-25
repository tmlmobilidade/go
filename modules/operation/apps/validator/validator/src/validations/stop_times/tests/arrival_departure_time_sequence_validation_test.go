package stop_times

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	stopTimesTypes "main/types/stop_times"
	validations "main/validations/stop_times/validations"
	"testing"
)

func TestArrivalDepartureTimeSequenceValidation(t *testing.T) {
	t.Run("Valid_Non_Decreasing", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.ArrivalDepartureTimeSequenceValidation(map[string][]stopTimesTypes.TimeSequenceStop{
			"trip1": {
				{Row: 3, StopSequence: 2, ArrivalTime: lib.Ptr("10:05:00"), DepartureTime: lib.Ptr("10:05:30")},
				{Row: 2, StopSequence: 1, ArrivalTime: lib.Ptr("10:00:00"), DepartureTime: lib.Ptr("10:01:00")},
				{Row: 4, StopSequence: 3, ArrivalTime: lib.Ptr("10:05:30"), DepartureTime: lib.Ptr("10:06:00")},
			},
		}, &types.StopTimesRules{ArrivalDepartureSequence: types.RuleConfig{Severity: types.SEVERITY_ERROR}})

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_Non_Decreasing", types.SEVERITY_ERROR)
	})

	t.Run("Invalid_Current_Arrival_Before_Previous_Departure", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.ArrivalDepartureTimeSequenceValidation(map[string][]stopTimesTypes.TimeSequenceStop{
			"trip1": {
				{Row: 2, StopSequence: 1, ArrivalTime: lib.Ptr("10:00:00"), DepartureTime: lib.Ptr("10:10:00")},
				{Row: 3, StopSequence: 2, ArrivalTime: lib.Ptr("10:09:59"), DepartureTime: lib.Ptr("10:12:00")},
			},
		}, &types.StopTimesRules{ArrivalDepartureSequence: types.RuleConfig{Severity: types.SEVERITY_ERROR}})

		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_Current_Arrival_Before_Previous_Departure", types.SEVERITY_ERROR)
	})

	t.Run("Invalid_Current_Departure_Before_Previous_Departure", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.ArrivalDepartureTimeSequenceValidation(map[string][]stopTimesTypes.TimeSequenceStop{
			"trip1": {
				{Row: 2, StopSequence: 1, ArrivalTime: lib.Ptr("25:00:00"), DepartureTime: lib.Ptr("25:10:00")},
				{Row: 3, StopSequence: 2, DepartureTime: lib.Ptr("25:09:59")},
			},
		}, &types.StopTimesRules{ArrivalDepartureSequence: types.RuleConfig{Severity: types.SEVERITY_ERROR}})

		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_Current_Departure_Before_Previous_Departure", types.SEVERITY_ERROR)
	})

	t.Run("Ignore_Severity", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.ArrivalDepartureTimeSequenceValidation(map[string][]stopTimesTypes.TimeSequenceStop{
			"trip1": {
				{Row: 2, StopSequence: 1, ArrivalTime: lib.Ptr("10:00:00"), DepartureTime: lib.Ptr("10:10:00")},
				{Row: 3, StopSequence: 2, ArrivalTime: lib.Ptr("10:09:59"), DepartureTime: lib.Ptr("10:12:00")},
			},
		}, &types.StopTimesRules{ArrivalDepartureSequence: types.RuleConfig{Severity: types.SEVERITY_IGNORE}})

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Ignore_Severity", types.SEVERITY_ERROR)
	})
}
