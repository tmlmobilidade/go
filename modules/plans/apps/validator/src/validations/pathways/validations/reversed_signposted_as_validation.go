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

	if pathways.ReversedSignpostedAs == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("reversed_signposted_as_validation.required", "reversed_signposted_as_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("reversed_signposted_as_validation.forbidden"))
		return
	}
}
