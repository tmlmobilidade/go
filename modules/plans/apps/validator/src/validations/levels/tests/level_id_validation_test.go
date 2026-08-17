package levels_tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/levels/validations"
	"testing"
)

func TestAllLevelIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericIdTestCases("level_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			level := &types.Levels{LevelId: tc.Id}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"levels": tc.ExistingIds}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.LevelIdValidation(level, tc.Row, *gtfs, &types.LevelsRules{LevelId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
