package fare_attributes

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/fare_attributes/validations"
	"testing"
)

func TestAllTransferDurationValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetValidShapeOptions()
	negativeOptions := test_helpers.GetInvalidShapeOptions()
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("transfer_duration") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var transferDuration *int
			if tc.Name == "Invalid_Value" {
				transferDuration = &negativeOptions[0]
			} else if tc.Value != nil {
				transferDuration = &validOptions[0]
			} else {
				transferDuration = nil
			}

			var rules *types.FareAttributesRules
			if tc.Name == "Required" {
				rules = &types.FareAttributesRules{TransferDuration: types.RuleConfig{Severity: types.SEVERITY_ERROR}}
			} else {
				rules = nil
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"fare_attributes": map[string][]int{"transfer_duration": []int{1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.TransferDurationValidation(&types.FareAttribute{TransferDuration: transferDuration}, tc.Row, gtfs, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	for _, tc := range test_helpers.GetGenericSeverityTestCases("transfer_duration") {
		if tc.Name != "Severity_Ignore_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"fare_attributes": map[string][]int{"transfer_duration": []int{1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.TransferDurationValidation(&types.FareAttribute{TransferDuration: &validOptions[tc.Row-1]}, tc.Row, gtfs, nil)
			expectedTotalMessages := tc.ExpectedErrors + tc.ExpectedWarnings
			test_helpers.AssertMessageCount(t, services.AppMessageService, expectedTotalMessages, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
