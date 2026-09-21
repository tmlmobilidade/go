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
  - Field: platform_code
  - Presence: Optional
  - Type: String

# Description

Platform identifier for a platform stop (a stop belonging to a station).
This should be just the platform identifier (eg. "G" or "3").
Words like "platform" or "track" (or the feed's language-specific equivalent) should not be included.
This allows feed consumers to more easily internationalize and localize the platform identifier into other languages.

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func PlatformCodeValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("platform_code", "stops.txt", "platform_code_valid", row, services.AppMessageService)
	if rules != nil && rules.PlatformCode.Severity != "" {
		ctx.WithSeverity(rules.PlatformCode.Severity)
	}

	if stop.PlatformCode == nil || *stop.PlatformCode == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("platform_code_validation.required", "platform_code_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("platform_code_validation.forbidden"))
		return
	}

	// Validate rules
	if rules != nil && rules.PlatformCode.Options != nil {
		if slices.Contains(*rules.PlatformCode.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.PlatformCode.Options, *stop.PlatformCode) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("platform_code_validation.not_allowed", *stop.PlatformCode))
			return
		}
	}
}
