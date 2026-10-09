package stop_times

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stop_times/validations"
	"testing"
)

func TestAllDropOffBookingRuleIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("drop_off_booking_rule_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var dropOffBookingRuleId *string
			if tc.Id != nil {
				dropOffBookingRuleId = tc.Id
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"booking_rules": {*dropOffBookingRuleId: {1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			if tc.Name == "ForeignKey_Invalid" {
				gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"booking_rules": {}}}.ToGtfsWithDB()
				if err != nil {
					t.Fatalf("failed to create mock gtfs: %v", err)
				}
				defer cleanup()
				validations.DropOffBookingRuleIdValidation(&types.StopTime{DropOffBookingRuleId: dropOffBookingRuleId}, tc.Row, gtfs, &types.StopTimesRules{DropOffBookingRuleId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
				test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
				return
			}

			validations.DropOffBookingRuleIdValidation(&types.StopTime{DropOffBookingRuleId: dropOffBookingRuleId}, tc.Row, gtfs, &types.StopTimesRules{DropOffBookingRuleId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}

	for _, tc := range test_helpers.GetGenericSeverityTestCases("drop_off_booking_rule_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"booking_rules": {}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.DropOffBookingRuleIdValidation(&types.StopTime{}, tc.Row, gtfs, &types.StopTimesRules{DropOffBookingRuleId: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	t.Run("Optional_NotPresent", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.DropOffBookingRuleIdValidation(&types.StopTime{}, 4, &types.Gtfs{}, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Optional_NotPresent", types.SEVERITY_ERROR)
	})

	t.Run("Missing_BookingRulesIndex", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.DropOffBookingRuleIdValidation(&types.StopTime{DropOffBookingRuleId: lib.Ptr("BR1")}, 3, &types.Gtfs{}, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "MissingBookingRulesIndex", types.SEVERITY_ERROR)
	})
}
