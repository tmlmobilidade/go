package trips

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [trips.txt]
  - Field: shape_id
  - Presence: Conditionally Required
  - Type: Foreign Key referencing shapes.shape_id

# Description

Identifies a geospatial shape describing the vehicle travel path for a trip.

Conditionally Required:
  - Required if the trip has a continuous pickup or drop-off behavior defined either in routes.txt or in stop_times.txt.
  - Optional otherwise.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func ShapeIdValidation(trip *types.Trip, row int, gtfs *types.Gtfs, rules *types.TripsRules, tripStopTimesCache map[string][]types.StopTimeRaw, routeRowsCache map[string][]int) {
	ctx := lib.NewValidationContext("shape_id", "trips.txt", "shape_id_references_shapes_table_when_present", row, services.AppMessageService)
	if rules != nil && rules.ShapeId.Severity != "" {
		ctx.WithSeverity(rules.ShapeId.Severity)
	}

	hasContinuousPickupDropoff := false

	if trip.RouteId == nil {
		return
	}

	// Check if the route has continuous pickup/dropoff behavior (use cache to avoid repeated queries)
	routeRows, err := gtfs.GetCachedRowsById(routeRowsCache, "routes", *trip.RouteId)
	if err != nil || len(routeRows) > 1 {
		ctx.AddError(ctx.GetTranslatedMessage("shape_id_validation.not_found", map[string]any{"shape_id": *trip.ShapeId}))
		return
	}

	routeRaw, err := gtfs.GetRoute(routeRows[0])
	if err == nil && routeRaw.ContinuousPickup != "" {
		hasContinuousPickupDropoff = true
	}

	// Check if the stop_times have continuous pickup/dropoff behavior
	// Use cached stop_times data instead of querying database
	stopTimesRaw, exists := tripStopTimesCache[*trip.TripId]
	if exists && !hasContinuousPickupDropoff {
		for _, stopTimeRaw := range stopTimesRaw {
			if continuousPickup := stopTimeRaw.ContinuousPickup; continuousPickup != "" {
				hasContinuousPickupDropoff = true
				break // Exit early once we find a continuous pickup
			}
		}
	} else if !exists {
		// Fallback to database query if not in cache (shouldn't happen)
		stopTimeRows, err := gtfs.GetRowsById("stop_times", *trip.TripId)
		if err == nil && len(stopTimeRows) > 0 && !hasContinuousPickupDropoff {
			for _, rowIndex := range stopTimeRows {
				stopTimeRaw, err := gtfs.GetStopTime(rowIndex)
				if err != nil {
					continue
				}
				if continuousPickup := stopTimeRaw.ContinuousPickup; continuousPickup != "" {
					hasContinuousPickupDropoff = true
					break // Exit early once we find a continuous pickup
				}
			}
		}
	}

	if hasContinuousPickupDropoff && trip.ShapeId == nil {
		ctx.AddError(ctx.GetTranslatedMessage("shape_id_validation.continuous_pickup_dropoff"))
		return
	}

	if trip.ShapeId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("shape_id_validation.required", "shape_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// Check Foreign Key
	if !lib.GtfsIdMapKeyExists(gtfs, "shapes", *trip.ShapeId) {
		ctx.AddError(ctx.GetTranslatedMessage("shape_id_validation.not_found", map[string]any{"shape_id": *trip.ShapeId}))
		return
	}

}
