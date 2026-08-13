package transfers

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [transfers.txt]
  - Field: from_stop_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing stops.stop_id

# Description

Identifies a stop (location_type=0) or a station (location_type=1) where a connection between routes begins.
If this field refers to a station, the transfer rule applies to all its child stops. It must refer to a stop (location_type=0) if transfer_type is 4 or 5.

Conditionally Required:
- Required if transfer_type is 1, 2, or 3.
- Optional if transfer_type is 4 or 5.

[transfers.txt]: https://gtfs.org/schedule/reference/#transfertstxt
*/

func FromStopIdValidation(transfer *types.Transfers, row int, gtfs types.Gtfs, rules *types.TransfersRules) {
	ctx := lib.NewValidationContext("from_stop_id", "transfers.txt", "transfer_from_stop_id_references_stops_table", row, services.AppMessageService)
	if rules != nil && rules.FromStopId.Severity != "" {
		ctx.WithSeverity(rules.FromStopId.Severity)
	}

	// Check if transfer_type is 4 or 5 (optional case)
	if transfer.TransferType != nil && (*transfer.TransferType == 4 || *transfer.TransferType == 5) {
		if transfer.FromStopId == nil {
			// Optional for transfer_type 4 or 5, so use warning severity
			ctx.WithSeverity(types.SEVERITY_WARNING)
			return
		}
		// If from_stop_id is provided for transfer_type 4 or 5, it must be a stop (location_type=0)
		// This will be validated below
	}

	// Check if required (transfer_type is 1, 2, or 3)
	if transfer.FromStopId == nil {
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
		message := ctx.GetRequiredMessage("from_stop_id_validation.required", "from_stop_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// Check Foreign Key
	if !lib.GtfsIdMapKeyExists(&gtfs, "stops", *transfer.FromStopId) {
		ctx.AddError(ctx.GetTranslatedMessage("from_stop_id_validation.not_found", *transfer.FromStopId))
		return
	}

	// Get the stop to check location_type
	stopRows, err := gtfs.GetRowsById("stops", *transfer.FromStopId)
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
		ctx.AddError(ctx.GetTranslatedMessage("from_stop_id_validation.invalid_location_type", *transfer.FromStopId, locationType))
		return
	}

	// Special rule: if transfer_type is 4 or 5, must be a stop (location_type=0)
	if transfer.TransferType != nil && (*transfer.TransferType == 4 || *transfer.TransferType == 5) {
		if locationType != 0 {
			ctx.AddError(ctx.GetTranslatedMessage("from_stop_id_validation.must_be_stop_for_transfer_type_4_5", *transfer.FromStopId, *transfer.TransferType))
			return
		}
	}
}
