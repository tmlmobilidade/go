package pathways_tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/pathways/validations"
	"testing"
)

func TestAllPathwayIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericIdTestCases("pathway_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			pathways := &types.Pathways{PathwayId: tc.Id}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"pathways": tc.ExistingIds}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			rules := &types.PathwaysRules{PathwayId: types.RuleConfig{Severity: types.SEVERITY_ERROR}}
			validations.PathwayIdValidation(pathways, tc.Row, gtfs, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
