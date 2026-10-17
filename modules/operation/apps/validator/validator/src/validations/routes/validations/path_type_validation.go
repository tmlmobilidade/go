package routes

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes

- File: [routes.txt]
- Field: path_type
- Presence: Optional
- Type: Enum

# Description

TML-specific field indicating the path type of a route.

Valid options are:

  - 1: First path type
  - 2: Second path type
  - 3: Third path type

This is a TML-specific extension to the GTFS standard.
*/
func PathTypeValidation(route *types.Route, row int, rules *types.RoutesRules) {
	ctx := lib.NewValidationContext("path_type", "routes.txt", "routes_path_type_valid_enum", row, services.AppMessageService)
	if rules != nil && rules.PathType.Severity != "" {
		ctx.WithSeverity(rules.PathType.Severity)
	}

	// 1. Validate path_type is present
	if route.PathType == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate path_type is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate Rule Options
	if rules != nil && rules.PathType.Options != nil {
		if slices.Contains(*rules.PathType.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.PathType.Options, *route.PathType) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", *route.PathType))
			return
		}
	}
}
