package transfers

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [transfers.txt]
  - Field: from_trip_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing trips.trip_id

# Description

Identifies a trip where a connection between routes begins.

If from_trip_id is defined, the transfer will apply to the arriving trip for the given from_stop_id.

If both from_trip_id and from_route_id are defined, the trip_id must belong to the route_id, and from_trip_id will take precedence.

Conditionally Required:
- Required if transfer_type is 4 or 5.
- Optional otherwise.

[transfers.txt]: https://gtfs.org/schedule/reference/#transfertstxt
*/
func FromTripIdValidation(transfer *types.Transfers, row int, gtfs types.Gtfs, rules *types.TransfersRules) {
	ctx := lib.NewValidationContext("from_trip_id", "transfers.txt", "transfer_from_trip_id_references_trips_table", row, services.AppMessageService)
	if rules != nil && rules.FromTripId.Severity != "" {
		ctx.WithSeverity(rules.FromTripId.Severity)
	}

	// Check if required (transfer_type is 4 or 5)
	if transfer.FromTripId == nil {
		if transfer.TransferType == nil || (*transfer.TransferType != 4 && *transfer.TransferType != 5) {
			// Optional when transfer_type is not 4 or 5 - add recommended if missing
			if ctx.ShouldSkip() {
				return
			}
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("from_trip_id_validation.recommended"))
			return
		}
		// Required for transfer_type 4 or 5
		if ctx.ShouldSkip() {
			return
		}
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("from_trip_id_validation.required"))
		return
	}

	// Check Foreign Key
	if !lib.GtfsIdMapKeyExists(&gtfs, "trips", *transfer.FromTripId) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("from_trip_id_validation.not_found", *transfer.FromTripId))
		return
	}

	// When both from_trip_id and from_route_id are defined, trip_id must belong to route_id
	if transfer.FromTripId != nil && *transfer.FromTripId != "" && transfer.FromRouteId != nil {
		tripRows, err := gtfs.GetRowsById("trips", *transfer.FromTripId)
		if err != nil || len(tripRows) == 0 {
			return
		}

		trip, err := gtfs.GetTrip(tripRows[0])
		if err != nil {
			return
		}

		if trip.RouteId != "" && trip.RouteId != *transfer.FromRouteId {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("from_trip_id_validation.trip_must_belong_to_route", *transfer.FromTripId, *transfer.FromRouteId, trip.RouteId))
			return
		}
	}
}
