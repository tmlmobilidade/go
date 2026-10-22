package trips_custom

import (
	"main/lib"
	"main/services"
	"main/types"
	trips_utils "main/validations/trips/utils"
	"strconv"
)

// StopCoordinates checks every distinct served stop against the densified trip shape.
func StopCoordinates(db *services.SQLiteContext, rules *types.RuleContext, geometry *trips_utils.Geometry) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trip_path_stop_coordinates_referenced_from_stops"

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

	err = times.ForEachMatching("trip_id", trip["trip_id"], func(row *services.SQLiteRow) error {
		id, err := row.Field("stop_id")
		if err != nil {
			return err
		}
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
	// 9. Check the stop_id values

	for _, id := range ids {
		found := false
		err = stops.ForEachMatching("stop_id", id, func(row *services.SQLiteRow) error {
			if found {
				return nil
			}
			fields, err := row.Fields("stop_lat", "stop_lon")
			if err != nil {
				return err
			}
			if fields["stop_lat"] == "" || fields["stop_lon"] == "" {
				return nil
			}
			found = true
			stop := types.StopCoordinatesValidation{StopId: id, StopLat: fields["stop_lat"], StopLon: fields["stop_lon"]}
			info, err := geometry.Distance(db, stop, trip["shape_id"])
			if err != nil {
				return err
			}
			if info != nil {
				lat, _ := strconv.ParseFloat(stop.StopLat, 64)
				lon, _ := strconv.ParseFloat(stop.StopLon, 64)
				ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid_distance_to_shape", lat, lon, id, info.ShapeID, info.ClosestShapePtSeq, info.ClosestShapePtLat, info.ClosestShapePtLon, info.DistanceMeters))
			}
			return nil
		})
		if err != nil {
			return err
		}
	}

	//
	// 10. Return success

	return nil
}
