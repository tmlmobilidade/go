package custom

import (
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	geoService "github.com/tmlmobilidade/go/packages-golang/validator/src/services/geo"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/geo"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes

  - File: [trips.txt], [stop_times.txt], [stops.txt], [shapes.txt]
  - Field: [trips.trip_id, trips.shape_id, stop_times.stop_id, stops.stop_lat, stops.stop_lon, shapes.shape_pt_lat, shapes.shape_pt_lon, shapes.shape_pt_sequence]
  - Presence: Required, Conditionally Required, Conditionally Required, Conditionally Required, Conditionally Required, Required, Required, Required
  - Type: Unique ID, Foreign ID referencing shapes.shape_id, Foreign ID referencing stops.stop_id, Latitude, Longitude, Latitude, Longitude, Non-negative integer

# Description

Checks the distance between each distinct served stop and the shape assigned to its trip.

Validation: Skips trips without trip_id or shape_id. Uses stop_times.txt to collect distinct non-empty stop
identifiers, then the first matching stops.txt row with both coordinates filled. Missing or unparseable stop
coordinates and unavailable shape geometry produce no distance finding. Shape points are ordered and resampled
approximately every 50 meters; the stop is compared with those discrete samples. A nearest sampled distance
strictly greater than 100 meters is reported for each affected trip, including when a cached result is reused.
Exactly 100 meters passes. The closest original shape vertex is supplied for diagnosis and can differ from the
closest sampled point.

Configuration: The 100-meter limit is fixed; Options do not change it. Distances to samples can overestimate the
distance to the continuous line. Coordinate-domain and missing-reference checks belong to other rules.

The comparison is skipped when this rule is configured as forbidden. Unavailable source or lookup tables skip the
check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [trips.txt], [stop_times.txt], [stops.txt], [shapes.txt].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
*/
func StopCoordinates(ctx *contextTypes.ValidationContext) error {

	//
	// 1. Require trip, stop-time, stop, and shape tables; create a local geometry cache.

	ready, err := validationutils.RequireTables(ctx, "trips", "stop_times", "stops", "shapes")
	if err != nil || !ready {
		return err
	}
	geometry := &geoService.Geometry{}

	//
	// 2. Visit each trip so findings remain associated with its source row.

	return context.ForEachRow(ctx, "trips", []string{"stop_id", "trip_id", "shape_id"}, func(rowCtx *contextTypes.ValidationContext) error {

		//
		// 3. Skip this trip when the rule configuration disables its check.

		if context.ShouldSkip(rowCtx) {
			return nil
		}

		//
		// 4. Read the trip ID and the shape ID used for its geometry.

		trip, err := queries.Fields(rowCtx.Source, "trip_id", "shape_id")
		if err != nil {
			return err
		}

		//
		// 5. Skip trips without a trip ID or shape ID.

		if trip["trip_id"] == "" || trip["shape_id"] == "" {
			return nil
		}

		//
		// 6. Load stop times to find the stops served by this trip.

		times, err := validationutils.Table(rowCtx, "stop_times")
		if err != nil {
			return err
		}

		//
		// 7. Load the stop table and prepare an ordered list of distinct stop IDs.

		stops, err := validationutils.Table(rowCtx, "stops")
		if err != nil {
			return err
		}
		ids := []string{}
		seen := map[string]bool{}

		//
		// 8. Collect each nonempty served stop ID once, preserving query order.

		err = queries.ForEachMatchingFields(times, "trip_id", []any{trip["trip_id"]}, []string{"stop_id"}, func(_ *sqliteTypes.SQLiteRow, fields map[string]string) error {
			id := fields["stop_id"]
			if id != "" && !seen[id] {
				ids = append(ids, id)
				seen[id] = true
			}
			return nil
		})
		if err != nil {
			return err
		}

		//
		// 9. Read each stop's first complete coordinates in batches.
		// Keep invalid nonempty coordinates: the geometry check handles them.

		coordinates := make(map[string]types.StopCoordinatesValidation, len(ids))
		err = queries.ForEachMatchingValuesFields(stops, "stop_id", ids, []string{"stop_id", "stop_lat", "stop_lon"}, func(_ *sqliteTypes.SQLiteRow, fields map[string]string) error {
			id := fields["stop_id"]
			if _, found := coordinates[id]; found || fields["stop_lat"] == "" || fields["stop_lon"] == "" {
				return nil
			}
			coordinates[id] = types.StopCoordinatesValidation{StopId: id, StopLat: fields["stop_lat"], StopLon: fields["stop_lon"]}
			return nil
		})
		if err != nil {
			return err
		}

		//
		// 10. Check stops in their collected order through the cached geometry service.
		// A cached result still produces a separate finding for each affected trip.

		for _, id := range ids {
			stop, found := coordinates[id]
			if !found {
				continue
			}
			info, err := geometry.Distance(rowCtx.DB, stop, trip["shape_id"])
			if err != nil {
				return err
			}
			if info != nil {
				lat, _ := strconv.ParseFloat(stop.StopLat, 64)
				lon, _ := strconv.ParseFloat(stop.StopLon, 64)
				context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid_distance_to_shape", lat, lon, id, info.ShapeID, info.ClosestShapePtSeq, info.ClosestShapePtLat, info.ClosestShapePtLon, info.DistanceMeters))
			}
		}

		//
		// 11. Finish this trip after reporting its distance violations.

		return nil
	})
}
