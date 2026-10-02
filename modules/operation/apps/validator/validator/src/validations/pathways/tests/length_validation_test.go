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

func TestAllLengthValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("length") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			severity := types.SEVERITY_ERROR
			var length *float32

			if tc.Name == "Invalid_Value" {
				lengthFloat, _ := strconv.ParseFloat("-1", 32)
				length = lib.Ptr(float32(lengthFloat))
			} else if tc.Value != nil {
				lengthFloat, _ := strconv.ParseFloat(*tc.Value, 32)
				length = lib.Ptr(float32(lengthFloat))
			} else {
				length = nil
			}

			pathwayMode := 1
			if tc.Name == "Recommended_Missing" {
				pathwayMode = 6
				severity = types.SEVERITY_WARNING
			}

			pathways := &types.Pathways{Length: length, PathwayMode: lib.Ptr(pathwayMode)}
			validations.LengthValidation(pathways, tc.Row, &types.PathwaysRules{Length: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
