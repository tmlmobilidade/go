package levels_tests

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/levels/validations"
	"testing"
)

func TestAllLevelIndexValidationTestCases(t *testing.T) {
	t.Run("Valid_Value", func(t *testing.T) {
		services.AppMessageService.Clear()
		levelIndex := &types.Levels{LevelIndex: lib.Ptr(float32(0.0))}
		validations.LevelIndexValidation(levelIndex, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_Value", types.SEVERITY_ERROR)
	})
	t.Run("Invalid_Value", func(t *testing.T) {
		services.AppMessageService.Clear()
		levelIndex := &types.Levels{}
		validations.LevelIndexValidation(levelIndex, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_Value", types.SEVERITY_ERROR)
	})
	t.Run("Required", func(t *testing.T) {
		services.AppMessageService.Clear()
		levelIndex := &types.Levels{LevelIndex: nil}
		validations.LevelIndexValidation(levelIndex, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Required", types.SEVERITY_ERROR)
	})
}
