package pathways_tests

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/pathways/validations"
	"strconv"
	"testing"
)

func TestAllStairCountValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("stair_count") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			severity := types.SEVERITY_ERROR
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			}

			var stairCount *uint16
			if tc.Value != nil {
				stairCountInt, _ := strconv.Atoi(*tc.Value)
				stairCount = lib.Ptr(uint16(stairCountInt))
			} else {
				stairCount = nil
			}
			pathways := &types.Pathways{StairCount: stairCount}

			if tc.Name == "Invalid_Value" {
				pathways.StairCount = nil
			}
			validations.StairCountValidation(pathways, tc.Row, &types.PathwaysRules{StairCount: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
