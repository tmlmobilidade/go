package routes

// import (
// 	"main/lib"
// 	"main/lib/test_helpers"
// 	"main/services"
// 	"main/types"
// 	validations "main/validations/routes/validations"
// 	"testing"
// )

// func TestLineLongNameValidation(t *testing.T) {
// 	t.Run("Missing_LineId_Skips", func(t *testing.T) {
// 		services.AppMessageService.Clear()

// 		validations.LineLongNameValidation(&types.Route{}, 1, nil, &types.RoutesRules{
// 			LineLongName: types.RuleConfig{Severity: types.SEVERITY_ERROR},
// 		})

// 		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Missing_LineId_Skips", types.SEVERITY_ERROR)
// 	})

// 	t.Run("Missing_LineLongName_When_LineId_Present_Errors", func(t *testing.T) {
// 		services.AppMessageService.Clear()

// 		validations.LineLongNameValidation(&types.Route{
// 			LineId: lib.Ptr("100"),
// 		}, 1, nil, &types.RoutesRules{
// 			LineLongName: types.RuleConfig{Severity: types.SEVERITY_ERROR},
// 		})

// 		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Missing_LineLongName_When_LineId_Present_Errors", types.SEVERITY_ERROR)
// 	})

// 	t.Run("LineLongName_Present_Passes", func(t *testing.T) {
// 		services.AppMessageService.Clear()

// 		validations.LineLongNameValidation(&types.Route{
// 			LineId:       lib.Ptr("100"),
// 			LineLongName: lib.Ptr("Lisboa - Cascais"),
// 		}, 1, nil, &types.RoutesRules{
// 			LineLongName: types.RuleConfig{Severity: types.SEVERITY_ERROR},
// 		})

// 		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "LineLongName_Present_Passes", types.SEVERITY_ERROR)
// 	})
// }
