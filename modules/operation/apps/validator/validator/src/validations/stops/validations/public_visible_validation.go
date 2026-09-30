package stops

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
	"strconv"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: public_visible
  - Presence: Optional
  - Type: Enum

# Description

Describes if the stop is visible to the public.

- 0 - No
- 1 - Yes

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func PublicVisibleValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("public_visible", "stops.txt", "stops_public_visible_valid_enum", row, services.AppMessageService)
	if rules != nil && rules.PublicVisible.Severity != "" {
		ctx.WithSeverity(rules.PublicVisible.Severity)
	}

	// 1. Validate public_visible is present
	if stop.PublicVisible == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("public_visible_validation.required", "public_visible_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate public_visible is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("public_visible_validation.forbidden"))
		return
	}

	// 3. Validate public_visible is a valid value
	validValues := []int{0, 1}
	if !slices.Contains(validValues, *stop.PublicVisible) {
		ctx.AddError(ctx.GetTranslatedMessage("public_visible_validation.invalid", strconv.Itoa(*stop.PublicVisible)))
		return
	}

	// 4. Validate Rule options
	if rules != nil && rules.PublicVisible.Options != nil {
		if slices.Contains(*rules.PublicVisible.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.PublicVisible.Options, strconv.Itoa(*stop.PublicVisible)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("public_visible_validation.not_allowed", *stop.PublicVisible))
			return
		}
	}
}
