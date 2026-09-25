package transfers

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [transfers.txt]
  - Field: from_route_id
  - Presence: optional
  - Type: Foreign ID referencing routes.route_id

# Description

Identifies a route where a connection begins.

If from_route_id is defined, the transfer will apply to the arriving trip on the route for the given from_stop_id.

If both from_trip_id and from_route_id are defined, the trip_id must belong to the route_id, and from_trip_id will take precedence.

[transfers.txt]: https://gtfs.org/schedule/reference/#transfertstxt
*/

func FromRouteIdValidation(transfer *types.Transfers, row int, gtfs types.Gtfs, rules *types.TransfersRules) {
	ctx := lib.NewValidationContext("from_route_id", "transfers.txt", "transfer_from_route_id_references_routes_table", row, services.AppMessageService)
	if rules != nil && rules.FromRouteId.Severity != "" {
		ctx.WithSeverity(rules.FromRouteId.Severity)
	}

	// Validation from_route_id
	if transfer.FromRouteId == nil {
		if transfer.FromTripId != nil {
			return
		}

		if ctx.ShouldSkip() {
			return
		}
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("from_route_id_validation.recommended"))
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("from_route_id_validation.forbidden"))
		return
	}

	// Validation foreign key from_route_id
	if !lib.GtfsIdMapKeyExists(&gtfs, "routes", *transfer.FromRouteId) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("from_route_id_validation.not_found", *transfer.FromRouteId))
		return
	}

	// When both from_trip_id and from_route_id are defined, trip_id must belong to route_id
	if transfer.FromTripId != nil && *transfer.FromTripId != "" {
		tripRows, err := gtfs.GetRowsById("trips", *transfer.FromTripId)
		if err != nil || len(tripRows) == 0 {
			// Trip not found - that would be validated by from_trip_id validation
			return
		}

		trip, err := gtfs.GetTrip(tripRows[0])
		if err != nil {
			return
		}

		if trip.RouteId != "" && trip.RouteId != *transfer.FromRouteId {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("from_route_id_validation.trip_must_belong_to_route", *transfer.FromTripId, *transfer.FromRouteId, trip.RouteId))
			return
		}
	}
}
