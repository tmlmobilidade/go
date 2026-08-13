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

	if frequency.StartTime == nil {
		ctx.AddError(ctx.GetTranslatedMessage("start_time_validation.required"))
		return
	}

	if !lib.ValidateTime(*frequency.StartTime) {
		ctx.AddError(ctx.GetTranslatedMessage("start_time_validation.invalid", frequency.StartTime))
		return
	}
}
