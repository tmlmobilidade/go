package transfers

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [transfers.txt]
  - Field: min_transfer_time
  - Presence: Optional
  - Type: Non-negative integer

# Description

Amount of time, in seconds, that must be available to permit a transfer between routes at the specified stops.
The min_transfer_time should be sufficient to permit a typical rider to move between the two stops, including buffer time to allow for schedule variance on each route.

[transfers.txt]: https://gtfs.org/schedule/reference/#transfertstxt
*/
func MinTransferTimeValidation(transfer *types.Transfers, row int, rules *types.TransfersRules) {
	ctx := lib.NewValidationContext("min_transfer_time", "transfers.txt", "min_transfer_time_non_negative_seconds", row, services.AppMessageService)
	if rules != nil && rules.MinTransferTime.Severity != "" {
		ctx.WithSeverity(rules.MinTransferTime.Severity)
	}

	if transfer.MinTransferTime == nil {
		if !ctx.ShouldSkip() {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("min_transfer_time_validation.required", "min_transfer_time_validation.recommended"))
		}
		return
	}

	if *transfer.MinTransferTime < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("transfers_validation.invalid", *transfer.MinTransferTime))
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("min_transfer_time_validation.forbidden"))
		return
	}
}
