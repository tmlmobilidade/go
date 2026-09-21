package stops

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stops/validations"
	"testing"
)

func TestAllLocationTypeValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetLocationTypeValidOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("location_type", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var locationType *int
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok {
					locationType = ptr
				}
			}

			var rules *types.StopsRules
			if tc.Name == "Missing_Value_Required" {
				rules = &types.StopsRules{LocationType: types.RuleConfig{Severity: types.SEVERITY_ERROR}}
			}

			stop := &types.Stop{LocationType: locationType}
			validations.LocationTypeValidation(stop, tc.Row, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}

	for _, tc := range test_helpers.GetGenericSeverityTestCases("location_type") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			validations.LocationTypeValidation(&types.Stop{}, tc.Row, &types.StopsRules{LocationType: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
