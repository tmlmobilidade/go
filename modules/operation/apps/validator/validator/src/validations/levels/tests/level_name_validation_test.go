package levels_tests

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/levels/validations"
	"testing"
)

func TestAllLevelNameValidationTestCases(t *testing.T) {
	t.Run("Valid_Value", func(t *testing.T) {
		services.AppMessageService.Clear()
		levelName := &types.Levels{LevelName: lib.Ptr("Mezzanine")}
		validations.LevelNameValidation(levelName, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_Value", types.SEVERITY_ERROR)
	})
	t.Run("Required", func(t *testing.T) {
		services.AppMessageService.Clear()
		levelName := &types.Levels{LevelName: nil}
		validations.LevelNameValidation(levelName, 1, &types.LevelsRules{LevelName: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Required", types.SEVERITY_ERROR)
	})
	t.Run("Recommended", func(t *testing.T) {
		services.AppMessageService.Clear()
		levelName := &types.Levels{LevelName: nil}
		validations.LevelNameValidation(levelName, 1, &types.LevelsRules{LevelName: types.RuleConfig{Severity: types.SEVERITY_WARNING}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Recommended", types.SEVERITY_WARNING)
	})
}
