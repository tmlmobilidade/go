package trips_custom

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	trips_utils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/trips/utils"
	"main/types"
	"strconv"
)

// StopCoordinates checks every distinct served stop against the densified trip shape.
func StopCoordinates(db *services.SQLiteContext, rules *types.RuleContext, geometry *trips_utils.Geometry) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_stop_coordinates"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("stop_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Check if the stop_id validation should run

	if ctx.ShouldSkip() {
		return nil
	}

	//
	// 4. Get the trip_id, shape_id values

	trip, err := db.Trips.Fields("trip_id", "shape_id")
	if err != nil {
		return err
	}

	//
	// 5. Skip empty stop_id values

	if trip["trip_id"] == "" || trip["shape_id"] == "" {
		return nil
	}

	//
	// 6. Get the stop_times table

	times, err := db.Table("stop_times")
	if err != nil {
		return err
	}

	//
	// 7. Get the stops table

	stops, err := db.Table("stops")
	if err != nil {
		return err
	}
	ids := []string{}
	seen := map[string]bool{}

	//
	// 8. Collect the matching rows

	err = times.ForEachMatchingFields("trip_id", trip["trip_id"], []string{"stop_id"}, func(_ *services.SQLiteRow, fields map[string]string) error {
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
	err = stops.ForEachMatchingValuesFields("stop_id", ids, []string{"stop_id", "stop_lat", "stop_lon"}, func(_ *services.SQLiteRow, fields map[string]string) error {
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
		info, err := geometry.Distance(db, stop, trip["shape_id"])
		if err != nil {
			return err
		}
		if info != nil {
			lat, _ := strconv.ParseFloat(stop.StopLat, 64)
			lon, _ := strconv.ParseFloat(stop.StopLon, 64)
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid_distance_to_shape", lat, lon, id, info.ShapeID, info.ClosestShapePtSeq, info.ClosestShapePtLat, info.ClosestShapePtLon, info.DistanceMeters))
		}
	}

	//
	// 10. Return success

	return nil
}
