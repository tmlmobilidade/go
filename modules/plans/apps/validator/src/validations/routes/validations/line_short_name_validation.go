package routes

// import (
// 	"main/lib"
// 	"main/services"
// 	"main/types"
// )

// /*
// # Attributes

// - File: [routes.txt]
// - Field: line_short_name
// - Presence: Conditionally Required
// - Type: string

// # Description

// Line Short Name for the specified route.

// Conditionally Required:
//   - Required if line_id column contains a value.
//   - Ignored if line_id column is empty.

// [routes.txt]: https://gtfs.org/schedule/reference/#routestxt
// */
// func LineShortNameValidation(route *types.Route, row int, gtfs *types.Gtfs, rules *types.RoutesRules) {
// 	ctx := lib.NewValidationContext("line_short_name", "routes.txt", "line_short_name_present_when_line_id_present", row, services.AppMessageService)
// 	if rules != nil && rules.LineShortName.Severity != "" {
// 		ctx.WithSeverity(rules.LineShortName.Severity)
// 	}

// 	// Check if line_id is present
// 	if route.LineId == nil || *route.LineId == "" {
// 		return
// 	}

// 	// Check if line_short_name is present
// 	if route.LineShortName == nil || *route.LineShortName == "" {
// 		if !ctx.ShouldSkip() {
// 			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("line_short_name_validation.required"))
// 		}
// 		return
// 	}

// 	// Validate line_short_name is different from route_short_name
// 	if route.RouteShortName != nil && *route.RouteShortName != *route.LineShortName {
// 		ctx.AddError(ctx.GetTranslatedMessage("line_short_name_validation.not_equal_to_route_short_name"))
// 	}
// }
