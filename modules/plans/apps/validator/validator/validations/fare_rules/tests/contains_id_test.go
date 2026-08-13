package fare_rules

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/fare_rules/validations"
	"testing"
)

func TestAllContainsIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("contains_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var containsId *string
			if tc.Id != nil {
				containsId = tc.Id
			}

			if tc.Name == "ForeignKey_Invalid" {
				gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": map[string][]int{*containsId: {}}}}.ToGtfsWithDB()
				if err != nil {
					t.Fatalf("failed to create mock gtfs: %v", err)
				}
				defer cleanup()
				validations.ContainsIdValidation(&types.FareRule{ContainsId: containsId}, tc.Row, gtfs, nil)
				test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
				return
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": map[string][]int{*containsId: {1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.ContainsIdValidation(&types.FareRule{ContainsId: containsId}, tc.Row, gtfs, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("contains_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var containsId *string
			if tc.Value != nil {
				containsId = tc.Value.(*string)
			} else {
				containsId = nil
			}
			// Set up GTFS IdMap only if containsId is not nil
			gtfsIdMap := types.GtfsIdMap{}
			if containsId != nil {
				gtfsIdMap["stops"] = map[string][]int{*containsId: {1}}
			}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: gtfsIdMap}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.ContainsIdValidation(&types.FareRule{ContainsId: containsId}, tc.Row, gtfs, &types.FareRulesRules{ContainsId: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
