package custom

import (
	geoService "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/geo"
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/utils"
)

// StopCoordinates checks every distinct served stop against the densified trip shape.
func StopCoordinates(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips", "stop_times", "stops", "shapes")
	if err != nil || !ready {
		return err
	}
	geometry := &geoService.Geometry{}

	return context.ForEachRow(ctx, "trips", []string{"stop_id", "trip_id", "shape_id"}, func(rowCtx *context.ValidationContext) error {
		//
		// 2. Check if the stop_id validation should run

		if context.ShouldSkip(rowCtx) {
			return nil
		}

		//
		// 3. Get the trip_id, shape_id values

		trip, err := queries.Fields(rowCtx.Source, "trip_id", "shape_id")
		if err != nil {
			return err
		}

		//
		// 4. Skip empty stop_id values

		if trip["trip_id"] == "" || trip["shape_id"] == "" {
			return nil
		}

		//
		// 5. Get the stop_times table

		times, err := validationutils.Table(rowCtx, "stop_times")
		if err != nil {
			return err
		}

		//
		// 6. Get the stops table

		stops, err := validationutils.Table(rowCtx, "stops")
		if err != nil {
			return err
		}
		ids := []string{}
		seen := map[string]bool{}

		//
		// 7. Collect the matching rows

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
		// 8. Read each stop's first complete coordinates in batches.
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

		// Check in the original served-stop order, retaining each trip's findings
		// even when the geometry result is shared with another trip.
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
		// 9. Return success

		return nil
	})
}
