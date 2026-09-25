package pathways

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [pathways.txt]
- Field: length
- Presence: optional
- Type: non-negative float

# Description

Horizontal length in meters of the pathway from the origin location (defined in from_stop_id) to the destination location (defined in to_stop_id).

This field is recommended for walkways (pathway_mode=1), fare gates (pathway_mode=6) and exit gates (pathway_mode=7).

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/

func LengthValidation(pathways *types.Pathways, row int, rules *types.PathwaysRules) {
	ctx := lib.NewValidationContext("length", "pathways.txt", "pathway_length_non_negative", row, services.AppMessageService)
	if rules != nil && rules.Length.Severity != "" {
		ctx.WithSeverity(rules.Length.Severity)
	}

	if pathways.Length == nil {
		if *pathways.PathwayMode == 1 || *pathways.PathwayMode == 6 || *pathways.PathwayMode == 7 {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("length_validation.recommended"))
			return
		}
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("length_validation.required", "length_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("length_validation.forbidden"))
		return
	}

	if *pathways.Length < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("length_validation.negative", *pathways.Length))
		return
	}
}
