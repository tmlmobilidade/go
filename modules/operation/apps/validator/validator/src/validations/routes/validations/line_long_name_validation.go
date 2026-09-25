package routes

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [routes.txt]
- Field: line_long_name
- Presence: Conditionally Required
- Type: string

# Description

Line Long Name for the specified route.

Conditionally Required:
  - Required if line_id column contains a value.
  - Ignored if line_id column is empty.

[routes.txt]: https://gtfs.org/schedule/reference/#routestxt
*/
func LineLongNameValidation(route *types.Route, row int, gtfs *types.Gtfs, rules *types.RoutesRules) {
	ctx := lib.NewValidationContext("line_long_name", "routes.txt", "routes_line_long_name_present_when_line_id_present", row, services.AppMessageService)
	if rules != nil && rules.LineLongName.Severity != "" {
		ctx.WithSeverity(rules.LineLongName.Severity)
	}

	// Check if line_id is present
	if route.LineId == nil {
		return
	}

	// Check if line_long_name is present
	if route.LineLongName == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("line_long_name_validation.required", "line_long_name_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// Check if line_long_name is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("line_long_name_validation.forbidden"))
		return
	}
}
