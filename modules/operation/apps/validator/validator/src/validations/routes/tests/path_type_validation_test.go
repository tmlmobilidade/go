package routes

import (
	"fmt"
	test_helpers "main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/routes/validations"
	"testing"
)

func TestAllPathTypeValidationTestCases(t *testing.T) {
	validOptions := []int{1, 2, 3}
	validOptionsStrings := make([]string, len(validOptions))
	for i, opt := range validOptions {
		validOptionsStrings[i] = fmt.Sprintf("%d", opt)
	}
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("path_type", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}

			var pathType *string
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok && ptr != nil {
					valStr := fmt.Sprintf("%d", *ptr)
					pathType = &valStr
				}
			}
			validations.PathTypeValidation(&types.Route{PathType: pathType}, tc.Row, &types.RoutesRules{PathType: types.RuleConfig{Severity: severity, Options: &validOptionsStrings}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
