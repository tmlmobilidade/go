package pathways_tests

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/pathways/validations"
	"testing"
)

func TestAllIsBidirectionalValidationTestCases(t *testing.T) {
	validOptions := []int{0, 1}
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("is_bidirectional", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var isBidirectional *int
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok && ptr != nil {
					isBidirectional = ptr
				}
			}
			pathways := &types.Pathways{IsBidirectional: isBidirectional, PathwayMode: lib.Ptr(1)}
			validations.IsBidirectionalValidation(pathways, tc.Row, &types.PathwaysRules{IsBidirectional: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	t.Run("Exit Gate Bidirectional", func(t *testing.T) {
		services.AppMessageService.Clear()
		pathways := &types.Pathways{IsBidirectional: lib.Ptr(1), PathwayMode: lib.Ptr(7)}
		validations.IsBidirectionalValidation(pathways, 1, &types.PathwaysRules{IsBidirectional: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Exit Gate Bidirectional", types.SEVERITY_ERROR)
	})
}
