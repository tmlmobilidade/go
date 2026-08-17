package pathways

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
- File: [pathways.txt]
- Field: max_slope
- Presence: optional
- Type: float

# Description

Maximum slope ratio of the pathway. Valid options are:

0 or empty - No slope.
Float - Slope ratio of the pathway, positive for upwards, negative for downwards.

This field should only be used with walkways (pathway_mode=1) and moving sidewalks (pathway_mode=3).

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/
func MaxSlopeValidation(pathways *types.Pathways, row int, rules *types.PathwaysRules) {
	ctx := lib.NewValidationContext("max_slope", "pathways.txt", "pathway_max_slope_allowed_for_pathway_mode", row, services.AppMessageService)
	if rules != nil && rules.MaxSlope.Severity != "" {
		ctx.WithSeverity(rules.MaxSlope.Severity)
	}

	if pathways.MaxSlope == nil {
		if ctx.ShouldSkip() {
			return
		}

		if *pathways.PathwayMode == 1 || *pathways.PathwayMode == 3 {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("max_slope_validation.recommended"))
			return
		}

		message := ctx.GetRequiredMessage("max_slope_validation.required", "max_slope_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("max_slope_validation.forbidden"))
		return
	}

	if *pathways.PathwayMode != 1 && *pathways.PathwayMode != 3 {
		if *pathways.MaxSlope == "0" {
			return
		}

		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("max_slope_validation.not_allowed_pathway_mode", *pathways.PathwayMode))
		return
	}
}
