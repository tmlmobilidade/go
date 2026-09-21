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

	if frequency.EndTime == nil {
		ctx.AddError(ctx.GetTranslatedMessage("end_time_validation.required"))
		return
	}

	if !lib.ValidateTime(*frequency.EndTime) {
		ctx.AddError(ctx.GetTranslatedMessage("end_time_validation.invalid", *frequency.EndTime))
		return
	}
}
