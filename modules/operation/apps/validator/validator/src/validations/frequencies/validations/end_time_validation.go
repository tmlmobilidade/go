package frequencies

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: frequencies.txt
  - Field: end_time
  - Presence: Required
  - Type: Time

# Description

Time at which service changes to a different headway (or ceases) at the first stop in the trip.

[frequencies.txt]: https://gtfs.org/schedule/reference/#frequenciestxt
*/
func EndTimeValidation(frequency *types.Frequencies, row int, rules *types.FrequenciesRules) {
	ctx := lib.NewValidationContext("end_time", "frequencies.txt", "frequency_end_time_valid", row, services.AppMessageService)
	if rules != nil && rules.EndTime.Severity != "" {
		ctx.WithSeverity(rules.EndTime.Severity)
	}

	// 1. Validate end_time is present
	if frequency.EndTime == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate end_time is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate end_time is a valid end_time
	if !lib.ValidateTime(*frequency.EndTime) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", *frequency.EndTime))
		return
	}
}
