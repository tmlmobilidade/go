package pathways

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
- File: [pathways.txt]
- Field: signposted_as
- Presence: optional
- Type: Text

# Description

Public facing text from physical signage that is visible to riders.

May be used to provide text directions to riders, such as 'follow signs to '. The text in singposted_as should appear exactly how it is printed on the signs.

When the physical signage is multilingual, this field may be populated and translated following the example of stops.stop_name in the field definition of feed_info.feed_lang.

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/

func SignpostedAsValidation(pathways *types.Pathways, row int, rules *types.PathwaysRules) {
	ctx := lib.NewValidationContext("signposted_as", "pathways.txt", "pathway_signposted_as", row, services.AppMessageService)
	if rules != nil && rules.SignpostedAs.Severity != "" {
		ctx.WithSeverity(rules.SignpostedAs.Severity)
	}

	if pathways.SignpostedAs == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("signposted_as_validation.required", "signposted_as_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("signposted_as_validation.forbidden"))
		return
	}
}
