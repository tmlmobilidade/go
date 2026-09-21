package transfers

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [transfers.txt]
  - Field: to_trip_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing trips.trip_id

# Description

Identifies a trip where a connection between routes begins.

If to_trip_id is defined, the transfer will apply to the arriving trip for the given to_stop_id.

If both to_trip_id and to_route_id are defined, the trip_id must belong to the route_id, and to_trip_id will take precedence.

Conditionally Required:
- Required if transfer_type is 4 or 5.
- Optional otherwise.

[transfers.txt]: https://gtfs.org/schedule/reference/#transfertstxt
*/
func ToTripIdValidation(transfer *types.Transfers, row int, gtfs types.Gtfs, rules *types.TransfersRules) {
	ctx := lib.NewValidationContext("to_trip_id", "transfers.txt", "transfer_to_trip_id_references_trips_table", row, services.AppMessageService)
	if rules != nil && rules.ToTripId.Severity != "" {
		ctx.WithSeverity(rules.ToTripId.Severity)
	}

	// Check if required (transfer_type is 4 or 5)
	if transfer.ToTripId == nil {
		if transfer.TransferType == nil || (*transfer.TransferType != 4 && *transfer.TransferType != 5) {
			// Optional when transfer_type is not 4 or 5 - add recommended if missing
			if ctx.ShouldSkip() {
				return
			}
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("to_trip_id_validation.recommended"))
			return
		}
		// Required for transfer_type 4 or 5
		if ctx.ShouldSkip() {
			return
		}
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("to_trip_id_validation.required"))
		return
	}

	// Check Foreign Key
	if !lib.GtfsIdMapKeyExists(&gtfs, "trips", *transfer.ToTripId) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("to_trip_id_validation.not_found", *transfer.ToTripId))
		return
	}

	// When both to_trip_id and to_route_id are defined, trip_id must belong to route_id
	if transfer.ToTripId != nil && *transfer.ToTripId != "" && transfer.ToRouteId != nil {
		tripRows, err := gtfs.GetRowsById("trips", *transfer.ToTripId)
		if err != nil || len(tripRows) == 0 {
			return
		}

		trip, err := gtfs.GetTrip(tripRows[0])
		if err != nil {
			return
		}

		if trip.RouteId != "" && trip.RouteId != *transfer.ToRouteId {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("to_trip_id_validation.trip_must_belong_to_route", *transfer.ToTripId, *transfer.ToRouteId, trip.RouteId))
			return
		}
	}
}
