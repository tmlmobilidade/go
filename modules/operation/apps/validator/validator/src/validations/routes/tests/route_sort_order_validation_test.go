package routes

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/routes/validations"
	"testing"
)

func TestAllRouteSortOrderValidationTestCases(t *testing.T) {
	negativeValue := -1
	zeroValue := 0
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("route_sort_order") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}

			var routeSortOrder *int
			if tc.Value != nil {
				if tc.Name == "Valid_Present" {
					val := 1
					routeSortOrder = &val
				} else {
					routeSortOrder = &zeroValue
				}
			}

			if tc.Name == "Invalid_Value" {
				routeSortOrder = &negativeValue
			}

			validations.RouteSortOrderValidation(&types.Route{RouteSortOrder: routeSortOrder}, tc.Row, &types.RoutesRules{RouteSortOrder: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	for _, tc := range test_helpers.GetGenericSeverityTestCases("route_sort_order") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			validations.RouteSortOrderValidation(&types.Route{RouteSortOrder: nil}, tc.Row, &types.RoutesRules{RouteSortOrder: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
