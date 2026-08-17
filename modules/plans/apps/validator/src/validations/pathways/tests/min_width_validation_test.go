package pathways_tests

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/pathways/validations"
	"testing"
)

func TestAllMinWidthValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("min_width") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			severity := types.SEVERITY_ERROR
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			}

			var minWidth *string
			if tc.Value != nil {
				minWidth = tc.Value
			} else {
				minWidth = nil
			}

			if tc.Name == "Valid_Present" {
				minWidth = lib.Ptr("21")
			}
			pathways := &types.Pathways{MinWidth: minWidth}
			validations.MinWidthValidation(pathways, tc.Row, &types.PathwaysRules{MinWidth: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	t.Run("less_than_1_meter", func(t *testing.T) {
		services.AppMessageService.Clear()
		pathways := &types.Pathways{MinWidth: lib.Ptr("0.5")}
		validations.MinWidthValidation(pathways, 1, &types.PathwaysRules{MinWidth: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "less_than_1_meter", types.SEVERITY_ERROR)
	})
}
