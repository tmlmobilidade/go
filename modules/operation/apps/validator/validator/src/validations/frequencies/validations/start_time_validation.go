package frequencies

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: frequencies.txt
  - Field: start_time
  - Presence: Required
  - Type: Time

# Description

Time at which the first vehicle departs from the first stop of the trip with the specified headway.

[frequencies.txt]: https://gtfs.org/schedule/reference/#frequenciestxt
*/
func StartTimeValidation(frequency *types.Frequencies, row int, rules *types.FrequenciesRules) {
	ctx := lib.NewValidationContext("start_time", "frequencies.txt", "frequency_start_time_valid", row, services.AppMessageService)
	if rules != nil && rules.StartTime.Severity != "" {
		ctx.WithSeverity(rules.StartTime.Severity)
	}

	// 1. Validate start_time is present
	if frequency.StartTime == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate start_time is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate start_time is a valid start_time
	if !lib.ValidateTime(*frequency.StartTime) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", *frequency.StartTime))
		return
	}
}
