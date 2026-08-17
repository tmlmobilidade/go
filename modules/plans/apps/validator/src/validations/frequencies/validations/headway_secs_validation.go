package frequencies

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: frequencies.txt
  - Field: headway_secs
  - Presence: Required
  - Type: positive integer

# Description

Headway of service in seconds.

[frequencies.txt]: https://gtfs.org/schedule/reference/#frequenciestxt
*/
func HeadwaySecsValidation(frequency *types.Frequencies, row int, rules *types.FrequenciesRules) {
	ctx := lib.NewValidationContext("headway_secs", "frequencies.txt", "headway_secs_positive_and_aligns_trip", row, services.AppMessageService)
	if rules != nil && rules.HeadwaySecs.Severity != "" {
		ctx.WithSeverity(rules.HeadwaySecs.Severity)
	}

	if frequency.HeadwaySecs == nil {
		ctx.AddError(ctx.GetTranslatedMessage("headway_secs_validation.required"))
		return
	}

	if *frequency.HeadwaySecs <= 0 {
		ctx.AddError(ctx.GetTranslatedMessage("headway_secs_validation.invalid"))
		return
	}
}
