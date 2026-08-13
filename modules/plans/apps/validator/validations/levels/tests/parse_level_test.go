package levels_tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/levels/validations"
	"testing"
)

func TestAllParseLevelTestCases(t *testing.T) {
	t.Run("Valid_Input", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.ParseLevel(types.LevelsRaw{LevelId: "L1", LevelIndex: "0.0", LevelName: "Level 1"}, 1)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_Input", types.SEVERITY_ERROR)
	})
	t.Run("Invalid_Input", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.ParseLevel(types.LevelsRaw{LevelId: "L1", LevelIndex: "not_a_float", LevelName: "Level 1"}, 1)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_Input", types.SEVERITY_ERROR)
	})
}
