package routes

// import (
// 	"main/lib"
// 	"main/services"
// 	"main/types"
// )

// /*
// # Attributes

// - File: [routes.txt]
// - Field: line_id
// - Presence: Optional
// - Type: string

// # Description

// Line ID for the specified route.

// Optional:
//   - Ignored if line_id is empty.
//   - Validated if line_id contains a value.

// [routes.txt]: https://gtfs.org/schedule/reference/#routestxt
// */
// func LineIdValidation(route *types.Route, row int, gtfs *types.Gtfs, rules *types.RoutesRules) {
// 	ctx := lib.NewValidationContext("line_id", "routes.txt", "line_id_required", row, services.AppMessageService)
// 	if rules != nil && rules.LineId.Severity != "" {
// 		ctx.WithSeverity(rules.LineId.Severity)
// 	}

// 	// If line_id is present.
// 	if route.LineId == nil || *route.LineId == "" {
// 		if !ctx.ShouldSkip() {
// 			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("line_id_required.required"))
// 		}
// 		return
// 	}

// 	// Check if line_id is the same as route_short_name
// 	if route.RouteShortName != nil && *route.LineId != *route.RouteShortName {
// 		ctx.AddError(ctx.GetTranslatedMessage("line_id_required.not_equal_to_route_short_name", *route.LineId, *route.RouteShortName))
// 	}
// }
