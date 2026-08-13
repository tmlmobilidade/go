package trips

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ParseTrips(rawTrips types.TripRaw, row int) types.Trip {
	var (
		trip                                            types.Trip = types.Trip{}
		tripId, routeId, serviceId, patternId           string
		tripHeadsign, tripShortName, blockId, shapeId   string
		directionId, wheelchairAccessible, bikesAllowed int
		messages                                        []types.Message
	)

	stringFields := map[string]*string{
		"trip_id":         &tripId,
		"route_id":        &routeId,
		"service_id":      &serviceId,
		"trip_headsign":   &tripHeadsign,
		"trip_short_name": &tripShortName,
		"block_id":        &blockId,
		"shape_id":        &shapeId,
		"pattern_id":      &patternId,
	}

	intFields := map[string]*int{
		"direction_id":          &directionId,
		"wheelchair_accessible": &wheelchairAccessible,
		"bikes_allowed":         &bikesAllowed,
	}

	// Helper to collect error messages
	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:        field,
			FileName:     "trips.txt",
			Rows:         []int{row},
			Message:      msg,
			Severity:     types.SEVERITY_ERROR,
			RuleID:       "trips_values_parse",
		})
	}

	// Parse string fields
	for field, target := range stringFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawTrips, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// Parse int fields
	for field, target := range intFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawTrips, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// If there are any errors, return an empty trip
	if len(messages) > 0 {
		services.AppMessageService.AddMessages(messages)
		return trip
	}

	// Required fields
	trip.Row = row
	trip.TripId = lib.IfThenElse(tripId != "", &tripId, nil)
	trip.RouteId = lib.IfThenElse(routeId != "", &routeId, nil)
	trip.ServiceId = lib.IfThenElse(serviceId != "", &serviceId, nil)

	// Optional fields
	trip.TripHeadsign = lib.IfThenElse(rawTrips.TripHeadsign != "", &tripHeadsign, nil)
	trip.TripShortName = lib.IfThenElse(rawTrips.TripShortName != "", &tripShortName, nil)
	trip.BlockId = lib.IfThenElse(rawTrips.BlockId != "", &blockId, nil)
	trip.ShapeId = lib.IfThenElse(rawTrips.ShapeId != "", &shapeId, nil)
	trip.DirectionId = lib.IfThenElse(rawTrips.DirectionId != "", &directionId, nil)
	trip.WheelchairAccessible = lib.IfThenElse(rawTrips.WheelchairAccessible != "", &wheelchairAccessible, nil)
	trip.BikesAllowed = lib.IfThenElse(rawTrips.BikesAllowed != "", &bikesAllowed, nil)
	trip.PatternId = lib.IfThenElse(rawTrips.PatternId != "", &patternId, nil)

	return trip
}
