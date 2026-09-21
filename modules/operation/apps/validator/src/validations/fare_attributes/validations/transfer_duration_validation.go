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
	ctx := lib.NewValidationContext("transfer_duration", "fare_attributes.txt", "transfer_duration_valid_seconds_range", row, services.AppMessageService)
	if rules != nil && rules.TransferDuration.Severity != "" {
		ctx.WithSeverity(rules.TransferDuration.Severity)
	}

	if fareAttribute.TransferDuration == nil {
		if !ctx.ShouldIgnore() {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("transfers_validation.required"))
		}
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("transfer_duration_validation.forbidden"))
		return
	}

	if *fareAttribute.TransferDuration < 0 {
		ctx.AddError(ctx.GetTranslatedMessage("transfers_validation.invalid", *fareAttribute.TransferDuration))
	}
}
