package frequencies

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
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
	ctx := lib.NewValidationContext("headway_secs", "frequencies.txt", "frequencies_headway_secs_positive_and_aligns_trip", row, services.AppMessageService)
	if rules != nil && rules.HeadwaySecs.Severity != "" {
		ctx.WithSeverity(rules.HeadwaySecs.Severity)
	}

	// 1. Validate headway_secs is present
	if frequency.HeadwaySecs == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate headway_secs is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate headway_secs is a valid headway_secs
	if *frequency.HeadwaySecs <= 0 {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", strconv.Itoa(*frequency.HeadwaySecs)))
		return
	}
}
