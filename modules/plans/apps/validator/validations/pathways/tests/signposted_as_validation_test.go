package pathways_tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/pathways/validations"
	"testing"
)

func TestAllSignpostedAsValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("signposted_as") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			severity := types.SEVERITY_ERROR
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			}
			var signpostedAs *string
			if tc.Value != nil {
				signpostedAs = tc.Value
			} else {
				signpostedAs = nil
			}
			pathways := &types.Pathways{SignpostedAs: signpostedAs}
			if tc.Name == "Invalid_Value" {
				pathways.SignpostedAs = nil
			}
			validations.SignpostedAsValidation(pathways, tc.Row, &types.PathwaysRules{SignpostedAs: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
