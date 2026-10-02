package stops

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: stop_url
  - Presence: Optional
  - Type: URL

# Description

URL of the transit stop.

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func StopUrlValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("stop_url", "stops.txt", "stop_url_valid_url", row, services.AppMessageService)
	if rules != nil && rules.StopUrl.Severity != "" {
		ctx.WithSeverity(rules.StopUrl.Severity)
	}

	// 1. Validate stop_url is present
	if stop.StopUrl == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate stop_url is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate stop_url is a valid url
	if !lib.ValidateUrl(*stop.StopUrl) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", *stop.StopUrl))
		return
	}

	// 4. Validate Rule options
	if rules != nil && rules.StopUrl.Options != nil {
		if slices.Contains(*rules.StopUrl.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.StopUrl.Options, *stop.StopUrl) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", *stop.StopUrl))
			return
		}
	}
}
