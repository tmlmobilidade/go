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

	if pathways.MinWidth == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("min_width_validation.required", "min_width_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("min_width_validation.forbidden"))
		return
	}

	minWidthFloat, err := strconv.ParseFloat(*pathways.MinWidth, 64)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("min_width_validation.invalid"))
		return
	}

	if minWidthFloat < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("min_width_validation.negative"))
		return
	}

	if minWidthFloat < 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("min_width_validation.recommended"))
		return
	}
}
