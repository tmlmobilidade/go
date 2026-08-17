package agency

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/agency/validations"
	"testing"
)

func TestAllAgencyNameIdMatchValidationTestCases(t *testing.T) {
	fieldName := "agency_name_id_match"

	compare := []types.Compare{
		{Key: "AGENCY1", Value: "Metro Transit"},
		{Key: "AGENCY2", Value: "City Bus"},
		{Key: "AGENCY3", Value: "Regional Rail"},
	}

	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases(fieldName) {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		if tc.Name == "Invalid_Id" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var severity types.Severity
			if tc.ExpectedErrors > 0 {
				severity = types.SEVERITY_ERROR
			} else {
				severity = types.SEVERITY_WARNING
			}

			agency := &types.Agency{}
			if tc.Name == "Invalid_Value" {
				agency = &types.Agency{}
			} else if tc.Value != nil {
				agency = &types.Agency{AgencyId: lib.Ptr("AGENCY1"), AgencyName: lib.Ptr("Metro Transit")}
			}

			validations.AgencyNameIdMatchValidation(agency, tc.Row, &types.AgencyRules{AgencyNameIdMatch: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases(fieldName) {
		if tc.Name != "Severity_Ignore_Missing" && tc.Name != "Severity_Forbidden_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			validations.AgencyNameIdMatchValidation(&types.Agency{AgencyId: lib.Ptr("AGENCY1"), AgencyName: lib.Ptr("Metro Transit")}, tc.Row, &types.AgencyRules{AgencyNameIdMatch: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, tc.Severity)
		})
	}

	t.Run("WithCompare_Match", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.AgencyNameIdMatchValidation(&types.Agency{AgencyId: lib.Ptr("AGENCY1"), AgencyName: lib.Ptr("Metro Transit")}, 1, &types.AgencyRules{AgencyNameIdMatch: types.RuleConfig{Severity: types.SEVERITY_ERROR, Compare: &compare}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Matching agency_id and agency_name should not error", types.SEVERITY_ERROR)
	})
	t.Run("WithCompare_NoMatch", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.AgencyNameIdMatchValidation(&types.Agency{AgencyId: lib.Ptr("AGENCY1"), AgencyName: lib.Ptr("Wrong Name")}, 1, &types.AgencyRules{AgencyNameIdMatch: types.RuleConfig{Severity: types.SEVERITY_ERROR, Compare: &compare}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Non-matching agency_id and agency_name should error", types.SEVERITY_ERROR)
	})
	t.Run("WithCompare_NoMatch_Warning", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.AgencyNameIdMatchValidation(&types.Agency{AgencyId: lib.Ptr("AGENCY1"), AgencyName: lib.Ptr("Wrong Name")}, 1, &types.AgencyRules{AgencyNameIdMatch: types.RuleConfig{Severity: types.SEVERITY_WARNING, Compare: &compare}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Non-matching agency_id and agency_name should warn", types.SEVERITY_WARNING)
	})
	t.Run("WithCompare_MultipleMatches", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.AgencyNameIdMatchValidation(&types.Agency{AgencyId: lib.Ptr("AGENCY1"), AgencyName: lib.Ptr("Metro Transit")}, 1, &types.AgencyRules{AgencyNameIdMatch: types.RuleConfig{Severity: types.SEVERITY_ERROR, Compare: &compare}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Matching agency_id and agency_name should not error even with multiple entries", types.SEVERITY_ERROR)
	})
}
