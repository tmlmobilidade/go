package transfers

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [transfers.txt]
  - Field: to_route_id
  - Presence: optional
  - Type: Foreign ID referencing routes.route_id

# Description

Identifies a route where a connection begins.

If to_route_id is defined, the transfer will apply to the departing trip on the route for the given to_stop_id.

If both to_trip_id and to_route_id are defined, the trip_id must belong to the route_id, and to_trip_id will take precedence.

[transfers.txt]: https://gtfs.org/schedule/reference/#transfertstxt
*/

func ToRouteIdValidation(transfer *types.Transfers, row int, gtfs types.Gtfs, rules *types.TransfersRules) {
	ctx := lib.NewValidationContext("to_route_id", "transfers.txt", "transfer_to_route_id_references_routes_table", row, services.AppMessageService)
	if rules != nil && rules.ToRouteId.Severity != "" {
		ctx.WithSeverity(rules.ToRouteId.Severity)
	}

	// Validation to_route_id
	if transfer.ToRouteId == nil {
		if transfer.ToTripId != nil {
			return
		}

		if ctx.ShouldSkip() {
			return
		}
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("to_route_id_validation.recommended"))
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("to_route_id_validation.forbidden"))
		return
	}

	// Validation foreign key to_route_id
	if !lib.GtfsIdMapKeyExists(&gtfs, "routes", *transfer.ToRouteId) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("to_route_id_validation.not_found", *transfer.ToRouteId))
		return
	}

	// When both to_trip_id and to_route_id are defined, trip_id must belong to route_id
	if transfer.ToTripId != nil && *transfer.ToTripId != "" {
		tripRows, err := gtfs.GetRowsById("trips", *transfer.ToTripId)
		if err != nil || len(tripRows) == 0 {
			// Trip not found - that would be validated by to_trip_id validation
			return
		}

		trip, err := gtfs.GetTrip(tripRows[0])
		if err != nil {
			return
		}

		if trip.RouteId != "" && trip.RouteId != *transfer.ToRouteId {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("to_route_id_validation.trip_must_belong_to_route", *transfer.ToTripId, *transfer.ToRouteId, trip.RouteId))
			return
		}
	}
}
