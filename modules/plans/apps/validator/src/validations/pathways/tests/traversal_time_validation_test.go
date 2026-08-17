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

func TestAllTraversalTimeValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("traversal_time") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			severity := types.SEVERITY_ERROR
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			}
			var traversalTime *int
			if tc.Name == "Invalid_Value" {
				traversalTime = lib.Ptr(-1)
			} else if tc.Value != nil {
				traversalTimeInt, _ := strconv.Atoi(*tc.Value)
				traversalTime = lib.Ptr(int(traversalTimeInt))
			} else {
				traversalTime = nil
			}

			pathways := &types.Pathways{TraversalTime: traversalTime}
			validations.TraversalTimeValidation(pathways, tc.Row, &types.PathwaysRules{TraversalTime: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
