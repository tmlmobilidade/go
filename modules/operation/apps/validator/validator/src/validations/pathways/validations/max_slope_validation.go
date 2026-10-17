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

	// 1. Validate max_slope is present
	if pathways.MaxSlope == nil {
		if ctx.ShouldSkip() {
			return
		}

		if *pathways.PathwayMode == 1 || *pathways.PathwayMode == 3 {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("recommended"))
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate max_slope is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate max_slope is a valid max_slope
	if *pathways.PathwayMode != 1 && *pathways.PathwayMode != 3 {
		if *pathways.MaxSlope == "0" {
			return
		}

		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed_pathway_mode", strconv.Itoa(*pathways.PathwayMode)))
		return
	}
}
