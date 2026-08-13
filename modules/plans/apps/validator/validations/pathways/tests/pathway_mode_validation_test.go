package pathways_tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/pathways/validations"
	"testing"
)

func TestAllPathwayModeValidationTestCases(t *testing.T) {
	validOptions := []int{1, 2, 3, 4, 5, 6, 7}
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("pathway_mode", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var pathwayMode *int
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok && ptr != nil {
					pathwayMode = ptr
				}
			}

			pathways := &types.Pathways{PathwayMode: pathwayMode}
			validations.PathwayModeValidation(pathways, tc.Row, &types.PathwaysRules{PathwayMode: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
