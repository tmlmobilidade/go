package fare_attributes

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [fare_attributes.txt]
  - Field: transfer_duration
  - Presence: Optional
  - Type: Non-negative integer

# Description

Length of time in seconds before a transfer expires. When transfers=0 this field may be used to indicate how long a ticket is valid for or it may be left empty.

[fare_attributes.txt]: https://gtfs.org/schedule/reference/#fare_attributestxt
*/
func TransferDurationValidation(fareAttribute *types.FareAttribute, row int, gtfs *types.Gtfs, rules *types.FareAttributesRules) {
	ctx := lib.NewValidationContext("transfer_duration", "fare_attributes.txt", "fare_attributes_transfer_duration_valid_seconds_range", row, services.AppMessageService)
	if rules != nil && rules.TransferDuration.Severity != "" {
		ctx.WithSeverity(rules.TransferDuration.Severity)
	}

	// 1. Validate transfer_duration is present
	if fareAttribute.TransferDuration == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate transfer_duration is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate transfer_duration is a valid transfer duration
	if *fareAttribute.TransferDuration < 0 {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", *fareAttribute.TransferDuration))
	}
}
