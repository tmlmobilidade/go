package pathways

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
)

/*
# Attributes
- File: [pathways.txt]
- Field: min_width
- Presence: optional
- Type: positive float

# Description

Minimum width of the pathway in meters.

This field is recommended if the minimum width is less than 1 meter.

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/
func MinWidthValidation(pathways *types.Pathways, row int, rules *types.PathwaysRules) {
	ctx := lib.NewValidationContext("min_width", "pathways.txt", "pathway_min_width_positive", row, services.AppMessageService)
	if rules != nil && rules.MinWidth.Severity != "" {
		ctx.WithSeverity(rules.MinWidth.Severity)
	}

	// 1. Validate min_width is present
	if pathways.MinWidth == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("min_width_validation.required", "min_width_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate min_width is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("min_width_validation.forbidden"))
		return
	}

	// 3. Validate min_width is a valid min_width
	minWidthFloat, err := strconv.ParseFloat(*pathways.MinWidth, 64)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("min_width_validation.invalid", *pathways.MinWidth))
		return
	}

	// 4. Validate min_width is a valid min_width
	if minWidthFloat < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("min_width_validation.negative"))
		return
	}

	// 5. Validate min_width is recommended
	if minWidthFloat < 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("min_width_validation.recommended"))
		return
	}
}
