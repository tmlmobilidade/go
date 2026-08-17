package pathways_tests

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/pathways/validations"
	"testing"
)

func TestAllMaxSlopeValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("max_slope") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			severity := types.SEVERITY_ERROR
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			}
			var maxSlope *string
			if tc.Value != nil {
				maxSlope = tc.Value
			} else {
				maxSlope = nil
			}

			pathways := &types.Pathways{MaxSlope: maxSlope, PathwayMode: lib.Ptr(1)}
			if tc.Name == "Invalid_Value" {
				pathways.MaxSlope = nil
			}
			validations.MaxSlopeValidation(pathways, tc.Row, &types.PathwaysRules{MaxSlope: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	t.Run("Not_Allowed_Pathway_Mode", func(t *testing.T) {
		services.AppMessageService.Clear()
		pathways := &types.Pathways{MaxSlope: lib.Ptr("1"), PathwayMode: lib.Ptr(2)}
		validations.MaxSlopeValidation(pathways, 1, &types.PathwaysRules{MaxSlope: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Not_Allowed_Pathway_Mode", types.SEVERITY_ERROR)
	})
}
