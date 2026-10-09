package stop_times

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stop_times/validations"
	"testing"
)

func TestAllPickupBookingRuleIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("pickup_booking_rule_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var pickupBookingRuleId *string
			if tc.Id != nil {
				pickupBookingRuleId = tc.Id
			} else {
				pickupBookingRuleId = nil
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"booking_rules": {*pickupBookingRuleId: {1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			if tc.Name == "ForeignKey_Invalid" {
				gtfs, cleanup, err = test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"booking_rules": {}}}.ToGtfsWithDB()
				if err != nil {
					t.Fatalf("failed to create mock gtfs: %v", err)
				}
				defer cleanup()
			}
			validations.PickupBookingRuleIdValidation(&types.StopTime{PickupBookingRuleId: pickupBookingRuleId}, tc.Row, gtfs, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("pickup_booking_rule_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"booking_rules": {}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.PickupBookingRuleIdValidation(&types.StopTime{}, tc.Row, gtfs, &types.StopTimesRules{PickupBookingRuleId: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	t.Run("Optional_NotPresent", func(t *testing.T) {
		services.AppMessageService.Clear()
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"booking_rules": {}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.PickupBookingRuleIdValidation(&types.StopTime{}, 4, gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Optional_NotPresent", types.SEVERITY_ERROR)
	})

	t.Run("Missing_BookingRulesIndex", func(t *testing.T) {
		services.AppMessageService.Clear()
		stopTime := &types.StopTime{PickupBookingRuleId: lib.Ptr("BR1")}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"booking_rules": {"BR1": {1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.PickupBookingRuleIdValidation(stopTime, 1, gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Missing_BookingRulesIndex", types.SEVERITY_ERROR)
	})
}
