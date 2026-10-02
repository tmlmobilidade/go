package pathways

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
- File: [pathways.txt]
- Field: reversed_signposted_as
- Presence: optional
- Type: Text

# Description

Same as signposted_as, but when the pathway is used from the to_stop_id to the from_stop_id.

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/
func ReversedSignpostedAsValidation(pathways *types.Pathways, row int, rules *types.PathwaysRules) {
	ctx := lib.NewValidationContext("reversed_signposted_as", "pathways.txt", "pathway_reversed_signposted_as", row, services.AppMessageService)
	if rules != nil && rules.ReversedSignpostedAs.Severity != "" {
		ctx.WithSeverity(rules.ReversedSignpostedAs.Severity)
	}

	// 1. Validate reversed_signposted_as is present
	if pathways.ReversedSignpostedAs == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate reversed_signposted_as is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}
}
