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
func PlatformCodeValidation(stop *types.Stop, row int, rules *types.RuleContext) {
	ctx := lib.NewValidationContext("platform_code", "stops.txt", "stops_platform_code_valid", row, services.AppMessageService, rules)

	if stop.PlatformCode == nil || *stop.PlatformCode == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// Validate rules
	if rules != nil && rules.Options != nil {
		if slices.Contains(*rules.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.Options, *stop.PlatformCode) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", *stop.PlatformCode))
			return
		}
	}
}
