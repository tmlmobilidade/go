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
- Presence: Optional (TML-specific)
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
	ctx := lib.NewValidationContext("path_type", "routes.txt", "path_type_valid_enum", row, services.AppMessageService)
	if rules != nil && rules.PathType.Severity != types.SEVERITY_IGNORE {
		ctx.WithSeverity(rules.PathType.Severity)
	}

	// Check Required
	if route.PathType == nil || *route.PathType == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("path_type_validation.required", "path_type_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// Check if field is forbidden - if present, it's an error
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("path_type_validation.forbidden"))
		return
	}

	// Validate Rule Options
	if rules != nil && rules.PathType.Options != nil {
		if slices.Contains(*rules.PathType.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.PathType.Options, *route.PathType) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("path_type_validation.not_allowed", *route.PathType))
			return
		}
	}
}
