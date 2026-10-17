package stop_times

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ParseStopTimes(rawStopTimes types.StopTimeRaw, row int) types.StopTime {
	var (
		stopTime types.StopTime = types.StopTime{}

		tripId, arrivalTime, departureTime, stopId, locationGroupId, locationId, stopHeadsign, startPickupDropOffWindow, endPickupDropOffWindow, pickupBookingRuleId, dropOffBookingRuleId string

		stopSequence, timepoint, pickupType, dropOffType, continuousPickup, continuousDropOff int
		shapeDistTraveled                                                                     float64
		messages                                                                              []types.Message
	)

	stringFields := map[string]*string{
		"stop_id":                      &stopId,
		"trip_id":                      &tripId,
		"arrival_time":                 &arrivalTime,
		"departure_time":               &departureTime,
		"stop_headsign":                &stopHeadsign,
		"start_pickup_drop_off_window": &startPickupDropOffWindow,
		"end_pickup_drop_off_window":   &endPickupDropOffWindow,
		"pickup_booking_rule_id":       &pickupBookingRuleId,
		"drop_off_booking_rule_id":     &dropOffBookingRuleId,
		"location_group_id":            &locationGroupId,
		"location_id":                  &locationId,
	}

	intFields := map[string]*int{
		"stop_sequence":       &stopSequence,
		"pickup_type":         &pickupType,
		"drop_off_type":       &dropOffType,
		"continuous_pickup":   &continuousPickup,
		"continuous_drop_off": &continuousDropOff,
		"timepoint":           &timepoint,
	}

	floatFields := map[string]*float64{
		"shape_dist_traveled": &shapeDistTraveled,
	}

	// Helper to collect error messages
	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:        field,
			FileName:     "stop_times.txt",
			Rows:         []int{row},
			Message:      msg,
			Severity:     types.SEVERITY_ERROR,
			RuleID:       "stop_times_values_parse",
		})
	}

	// Parse string fields
	for field, target := range stringFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawStopTimes, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// Parse int fields
	for field, target := range intFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawStopTimes, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// Parse float fields
	for field, target := range floatFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawStopTimes, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	if len(messages) > 0 {
		services.AppMessageService.AddMessages(messages)
		return types.StopTime{}
	}

	stopTime.TripId = lib.IfThenElse(rawStopTimes.TripId != "", &tripId, nil)
	stopTime.ArrivalTime = lib.IfThenElse(rawStopTimes.ArrivalTime != "", &arrivalTime, nil)
	stopTime.DepartureTime = lib.IfThenElse(rawStopTimes.DepartureTime != "", &departureTime, nil)
	stopTime.StopId = lib.IfThenElse(rawStopTimes.StopId != "", &stopId, nil)
	stopTime.LocationGroupId = lib.IfThenElse(rawStopTimes.LocationGroupId != "", &locationGroupId, nil)
	stopTime.LocationId = lib.IfThenElse(rawStopTimes.LocationId != "", &locationId, nil)
	stopTime.StopSequence = lib.IfThenElse(rawStopTimes.StopSequence != "", &stopSequence, nil)
	stopTime.StopHeadsign = lib.IfThenElse(rawStopTimes.StopHeadsign != "", &stopHeadsign, nil)
	stopTime.StartPickupDropOffWindow = lib.IfThenElse(rawStopTimes.StartPickupDropOffWindow != "", &startPickupDropOffWindow, nil)
	stopTime.EndPickupDropOffWindow = lib.IfThenElse(rawStopTimes.EndPickupDropOffWindow != "", &endPickupDropOffWindow, nil)
	stopTime.PickupType = lib.IfThenElse(rawStopTimes.PickupType != "", &pickupType, nil)
	stopTime.DropOffType = lib.IfThenElse(rawStopTimes.DropOffType != "", &dropOffType, nil)
	stopTime.ContinuousPickup = lib.IfThenElse(rawStopTimes.ContinuousPickup != "", &continuousPickup, nil)
	stopTime.ContinuousDropOff = lib.IfThenElse(rawStopTimes.ContinuousDropOff != "", &continuousDropOff, nil)
	stopTime.ShapeDistTraveled = lib.IfThenElse(rawStopTimes.ShapeDistTraveled != "", &shapeDistTraveled, nil)
	stopTime.Timepoint = lib.IfThenElse(rawStopTimes.Timepoint != "", &timepoint, nil)
	stopTime.PickupBookingRuleId = lib.IfThenElse(rawStopTimes.PickupBookingRuleId != "", &pickupBookingRuleId, nil)
	stopTime.DropOffBookingRuleId = lib.IfThenElse(rawStopTimes.DropOffBookingRuleId != "", &dropOffBookingRuleId, nil)

	return stopTime
}
