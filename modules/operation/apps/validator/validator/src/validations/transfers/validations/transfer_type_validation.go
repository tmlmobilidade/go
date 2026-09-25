package transfers

import (
	"fmt"
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes
  - File: [transfers.txt]
  - Field: transfer_type
  - Presence: Required
  - Type: Enum

# Description

Indicates the type of connection for the specified (from_stop_id, to_stop_id) pair. Valid options are:

0 or empty - Recommended transfer point between routes.
1 - Timed transfer point between two routes. The departing vehicle is expected to wait for the arriving one and leave sufficient time for a rider to transfer between routes.
2 - Transfer requires a minimum amount of time between arrival and departure to ensure a connection. The time required to transfer is specified by min_transfer_time.
3 - Transfers are not possible between routes at the location.
4 - Passengers can transfer from one trip to another by staying onboard the same vehicle (an "in-seat transfer"). More details about this type of transfer below.
5 - In-seat transfers are not allowed between sequential trips. The passenger must alight from the vehicle and re-board. More details about this type of transfer below.

[transfers.txt]: https://gtfs.org/schedule/reference/#transfertstxt
*/
func TransferTypeValidation(transfer *types.Transfers, row int, rules *types.TransfersRules) {
	ctx := lib.NewValidationContext("transfer_type", "transfers.txt", "transfer_type_valid_gtfs_enum", row, services.AppMessageService)
	if rules != nil && rules.TransferType.Severity != "" {
		ctx.WithSeverity(rules.TransferType.Severity)
	}

	if transfer.TransferType == nil {
		if ctx.ShouldSkip() {
			return
		}

		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("transfer_type_validation.required"))
		return
	}

	validTransferTypes := []int{0, 1, 2, 3, 4, 5}
	if !slices.Contains(validTransferTypes, *transfer.TransferType) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("transfer_type_validation.invalid", *transfer.TransferType))
		return
	}

	// Validate Rule Options
	if rules != nil && rules.TransferType.Options != nil {
		if slices.Contains(*rules.TransferType.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.TransferType.Options, fmt.Sprintf("%d", *transfer.TransferType)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("transfer_type_validation.not_allowed", fmt.Sprintf("%d", *transfer.TransferType)))
			return
		}
	}
}
