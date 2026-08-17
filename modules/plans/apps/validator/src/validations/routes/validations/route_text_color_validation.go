package routes

import (
	"main/lib"
	"main/services"
	"main/types"
	"regexp"
	"slices"
	"strings"
)

/*
# Attributes

- File: [routes.txt]
- Field: route_text_color
- Presence: Optional
- Type: Color

# Description

Route color designation that matches public facing material. Defaults to white (FFFFFF) when omitted or left empty. The color difference between route_text_color and route_text_color should provide sufficient contrast when viewed on a black and white screen.

[routes.txt]: https://gtfs.org/schedule/reference/#routestxt
*/
func RouteTextColorValidation(route *types.Route, row int, rules *types.RoutesRules) {
	ctx := lib.NewValidationContext("route_text_color", "routes.txt", "route_text_color_valid_hex_contrast", row, services.AppMessageService)
	if rules != nil && rules.RouteTextColor.Severity != "" {
		ctx.WithSeverity(rules.RouteTextColor.Severity)
	}

	if route.RouteTextColor == nil || *route.RouteTextColor == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("route_text_color_validation.required", "route_text_color_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_text_color_validation.forbidden"))
		return
	}

	color := strings.ToUpper(*route.RouteTextColor)
	matched, _ := regexp.MatchString(`^[0-9A-F]{6}$`, color)
	if !matched {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_text_color_validation.invalid"))
		return
	}

	// Validate rules
	if rules != nil && rules.RouteTextColor.Options != nil {
		if slices.Contains(*rules.RouteTextColor.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.RouteTextColor.Options, *route.RouteTextColor) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_text_color_validation.not_allowed", map[string]any{"value": *route.RouteTextColor}))
			return
		}
	}
}
