package pathways_tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/pathways/validations"
	"testing"
)

func TestAllReversedSignpostedAsValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("reversed_signposted_as") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			severity := types.SEVERITY_ERROR
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			}
			var reversedSignpostedAs *string
			if tc.Value != nil {
				reversedSignpostedAs = tc.Value
			} else {
				reversedSignpostedAs = nil
			}
			pathways := &types.Pathways{ReversedSignpostedAs: reversedSignpostedAs}
			if tc.Name == "Invalid_Value" {
				pathways.ReversedSignpostedAs = nil
			}
			validations.ReversedSignpostedAsValidation(pathways, tc.Row, &types.PathwaysRules{ReversedSignpostedAs: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
