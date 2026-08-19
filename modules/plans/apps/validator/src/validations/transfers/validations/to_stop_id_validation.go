package transfers

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [transfers.txt]
  - Field: to_stop_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing stops.stop_id

# Description

Identifies a stop (location_type=0) or a station (location_type=1) where a connection between routes ends.
If this field refers to a station, the transfer rule applies to all its child stops. It must refer to a stop (location_type=0) if transfer_type is 4 or 5.

Conditionally Required:
- Required if transfer_type is 1, 2, or 3.
- Optional if transfer_type is 4 or 5.

[transfers.txt]: https://gtfs.org/schedule/reference/#transfertstxt
*/

func ToStopIdValidation(transfer *types.Transfers, row int, gtfs types.Gtfs, rules *types.TransfersRules) {
	ctx := lib.NewValidationContext("to_stop_id", "transfers.txt", "transfer_to_stop_id_references_stops_table", row, services.AppMessageService)
	if rules != nil && rules.ToStopId.Severity != "" {
		ctx.WithSeverity(rules.ToStopId.Severity)
	}

	// Check if transfer_type is 4 or 5 (optional case)
	if transfer.TransferType != nil && (*transfer.TransferType == 4 || *transfer.TransferType == 5) {
		if transfer.ToStopId == nil {
			// Optional for transfer_type 4 or 5, so use warning severity
			ctx.WithSeverity(types.SEVERITY_WARNING)
			return
		}
		// If to_stop_id is provided for transfer_type 4 or 5, it must be a stop (location_type=0)
		// This will be validated below
	}

	// Check if required (transfer_type is 1, 2, or 3)
	if transfer.ToStopId == nil {
		if transfer.TransferType == nil || (*transfer.TransferType != 1 && *transfer.TransferType != 2 && *transfer.TransferType != 3) {
			// Not required for transfer_type 4 or 5
			if ctx.ShouldSkip() {
				return
			}
			ctx.WithSeverity(types.SEVERITY_WARNING)
			return
		}
		// Required for transfer_type 1, 2, or 3
		if ctx.ShouldSkip() {
			return
		}
		message := ctx.GetRequiredMessage("to_stop_id_validation.required", "to_stop_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// Check Foreign Key
	if !lib.GtfsIdMapKeyExists(&gtfs, "stops", *transfer.ToStopId) {
		ctx.AddError(ctx.GetTranslatedMessage("to_stop_id_validation.not_found", *transfer.ToStopId))
		return
	}

	// Get the stop to check location_type
	stopRows, err := gtfs.GetRowsById("stops", *transfer.ToStopId)
	if err != nil || len(stopRows) == 0 {
		return // Already handled by foreign key check above
	}

	stop, err := gtfs.GetStop(stopRows[0])
	if err != nil {
		return
	}

	// Parse location_type
	var locationType int
	locationTypeStr := stop.LocationType
	if locationTypeStr == "" {
		locationType = 0 // Empty defaults to 0 (stop/platform)
	} else {
		if errMsg := lib.ParseStringToPrimitive(locationTypeStr, &locationType); errMsg != "" {
			// If location_type cannot be parsed, skip this validation
			return
		}
	}

	// Validate location_type
	// General rule: must be stop (location_type=0) or station (location_type=1)
	if locationType != 0 && locationType != 1 {
		ctx.AddError(ctx.GetTranslatedMessage("to_stop_id_validation.invalid_location_type", *transfer.ToStopId, locationType))
		return
	}

	// Special rule: if transfer_type is 4 or 5, must be a stop (location_type=0)
	if transfer.TransferType != nil && (*transfer.TransferType == 4 || *transfer.TransferType == 5) {
		if locationType != 0 {
			ctx.AddError(ctx.GetTranslatedMessage("to_stop_id_validation.must_be_stop_for_transfer_type_4_5", *transfer.ToStopId, *transfer.TransferType))
			return
		}
	}

	// Validate to_stop_id must be different from from_stop_id
	if transfer.FromStopId != nil && *transfer.FromStopId == *transfer.ToStopId {
		ctx.AddError(ctx.GetTranslatedMessage("to_stop_id_validation.must_be_different_from_from_stop_id", *transfer.ToStopId, *transfer.FromStopId))
		return
	}
}
