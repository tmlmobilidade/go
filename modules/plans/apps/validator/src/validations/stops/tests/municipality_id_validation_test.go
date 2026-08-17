package stops

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stops/validations"
	"testing"
)

func TestAllMunicipalityIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("municipality_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var municipalityId *string
			if tc.Value != nil {
				municipalityId = tc.Value
			}

			stop := &types.Stop{MunicipalityId: municipalityId}
			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}
			validations.MunicipalityIdValidation(stop, tc.Row, &types.StopsRules{MunicipalityId: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("municipality_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			stop := &types.Stop{}
			validations.MunicipalityIdValidation(stop, tc.Row, &types.StopsRules{MunicipalityId: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	t.Run("DefaultSeverity", func(t *testing.T) {
		services.AppMessageService.Clear()
		stop := &types.Stop{}
		validations.MunicipalityIdValidation(stop, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "DefaultSeverity", types.SEVERITY_ERROR)
	})
}
