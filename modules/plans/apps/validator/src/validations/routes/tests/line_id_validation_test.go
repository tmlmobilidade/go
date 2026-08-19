package routes

// import (
// 	"main/lib"
// 	"main/lib/test_helpers"
// 	"main/services"
// 	"main/types"
// 	validations "main/validations/routes/validations"
// 	"testing"
// )

// func TestLineIdValidation(t *testing.T) {
// 	t.Run("Missing_LineId_Warns", func(t *testing.T) {
// 		services.AppMessageService.Clear()

// 		validations.LineIdValidation(&types.Route{}, 1, nil, &types.RoutesRules{
// 			LineId: types.RuleConfig{Severity: types.SEVERITY_WARNING},
// 		})

// 		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Missing_LineId_Warns", types.SEVERITY_ERROR)
// 		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Missing_LineId_Warns", types.SEVERITY_WARNING)
// 	})

// 	t.Run("Same_As_RouteShortName_Passes", func(t *testing.T) {
// 		services.AppMessageService.Clear()

// 		validations.LineIdValidation(&types.Route{
// 			LineId:         lib.Ptr("100"),
// 			RouteShortName: lib.Ptr("100"),
// 		}, 1, nil, &types.RoutesRules{
// 			LineId: types.RuleConfig{Severity: types.SEVERITY_ERROR},
// 		})

// 		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Same_As_RouteShortName_Passes", types.SEVERITY_ERROR)
// 	})

// 	t.Run("Different_From_RouteShortName_Errors", func(t *testing.T) {
// 		services.AppMessageService.Clear()

// 		validations.LineIdValidation(&types.Route{
// 			LineId:         lib.Ptr("100"),
// 			RouteShortName: lib.Ptr("101"),
// 		}, 1, nil, &types.RoutesRules{
// 			LineId: types.RuleConfig{Severity: types.SEVERITY_ERROR},
// 		})

// 		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Different_From_RouteShortName_Errors", types.SEVERITY_ERROR)
// 	})
// }
