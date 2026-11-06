package custom

import (
	geoService "github.com/tmlmobilidade/go/packages-golang/validator/src/services/geo"
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/geo"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
* StopCoordinates checks each distinct served stop against its trip's sampled shape.
* Geometry caches shapes and stop-shape results for this invocation, while each
* trip retains its own findings. Reports identify the closest original shape point.
 */
func StopCoordinates(ctx *context.ValidationContext) error {

	//
	// 1. Require trip, stop-time, stop, and shape tables; create a local geometry cache.

	ready, err := validationutils.RequireTables(ctx, "trips", "stop_times", "stops", "shapes")
	if err != nil || !ready {
		return err
	}
	geometry := &geoService.Geometry{}

	//
	// 2. Visit each trip so findings remain associated with its source row.

	return context.ForEachRow(ctx, "trips", []string{"stop_id", "trip_id", "shape_id"}, func(rowCtx *context.ValidationContext) error {

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
