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

	if stop.StopUrl == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("stop_url_validation.required", "stop_url_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_url_validation.forbidden"))
		return
	}

	if !lib.ValidateUrl(*stop.StopUrl) {
		ctx.AddError(ctx.GetTranslatedMessage("stop_url_validation.invalid", *stop.StopUrl))
		return
	}

	// Validate rules
	if rules != nil && rules.StopUrl.Options != nil {
		if slices.Contains(*rules.StopUrl.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.StopUrl.Options, *stop.StopUrl) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_url_validation.not_allowed", *stop.StopUrl))
			return
		}
	}
}
