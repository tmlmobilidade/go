package routes

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/routes/validations"
	"testing"
)

func TestLineShortNameValidation(t *testing.T) {
	t.Run("Missing_LineId_Skips", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.LineShortNameValidation(&types.Route{}, 1, nil, &types.RoutesRules{
			LineShortName: types.RuleConfig{Severity: types.SEVERITY_ERROR},
		})

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Missing_LineId_Skips", types.SEVERITY_ERROR)
	})

	t.Run("Missing_LineShortName_When_LineId_Present_Errors", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.LineShortNameValidation(&types.Route{
			LineId: lib.Ptr("100"),
		}, 1, nil, &types.RoutesRules{
			LineShortName: types.RuleConfig{Severity: types.SEVERITY_ERROR},
		})

		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Missing_LineShortName_When_LineId_Present_Errors", types.SEVERITY_ERROR)
	})

	t.Run("Same_As_RouteShortName_Errors", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.LineShortNameValidation(&types.Route{
			LineId:         lib.Ptr("100"),
			LineShortName:  lib.Ptr("Lisboa"),
			RouteShortName: lib.Ptr("Lisboa"),
		}, 1, nil, &types.RoutesRules{
			LineShortName: types.RuleConfig{Severity: types.SEVERITY_ERROR},
		})

		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Same_As_RouteShortName_Errors", types.SEVERITY_ERROR)
	})

	t.Run("Different_From_RouteShortName_Passes", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.LineShortNameValidation(&types.Route{
			LineId:         lib.Ptr("100"),
			LineShortName:  lib.Ptr("100"),
			RouteShortName: lib.Ptr("101"),
		}, 1, nil, &types.RoutesRules{
			LineShortName: types.RuleConfig{Severity: types.SEVERITY_ERROR},
		})

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Different_From_RouteShortName_Passes", types.SEVERITY_ERROR)
	})
}
