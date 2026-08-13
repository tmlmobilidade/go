package stop_times

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/types"
	stopTimesTypes "main/types/stop_times"
	registry "main/validations"
	validations "main/validations/stop_times/validations"
	"strconv"
)

func init() {
	registry.Register("stop_times", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running StopTimes Validations...")

	// Pre-load stop location_type cache for performance
	// This avoids repeated database queries in stop_id validation
	lib.AppLogger.Debug("Pre-loading stop location_type cache...")
	stopLocationTypeCache := make(map[string]string) // stop_id -> location_type
	err := gtfs.IterateStops(func(i int, rawStop types.StopRaw) error {
		if rawStop.StopId != "" {
			stopLocationTypeCache[rawStop.StopId] = rawStop.LocationType
		}
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error pre-loading stop location_type cache: %v", err))
	}
	lib.AppLogger.Debug(fmt.Sprintf("Pre-loaded location_type for %d stops", len(stopLocationTypeCache)))

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "stop_times", config.ProgressThresholdLarge)

	// Pre-compute min/max stop sequences per trip_id for performance
	// This avoids N+1 queries in arrival_time validation
	tripStopSequences := make(map[string]types.TripStopSequence)
	tripStopTimes := make(map[string][]stopTimesTypes.TimeSequenceStop)

	var stopTimesRules *types.StopTimesRules
	if rules != nil {
		stopTimesRules = &rules.StopTimes
	}

	// Single iteration: combine pre-computation and validation
	err = gtfs.IterateStopTimes(func(i int, rawStopTime types.StopTimeRaw) error {
		tracker.Track()

		// Pre-compute trip stop sequences
		if rawStopTime.TripId != "" && rawStopTime.StopSequence != "" {
			tripId := rawStopTime.TripId
			stopSeq, err := strconv.Atoi(rawStopTime.StopSequence)
			if err == nil {
				if seq, exists := tripStopSequences[tripId]; exists {
					if stopSeq < seq.Min {
						seq.Min = stopSeq
					}
					if stopSeq > seq.Max {
						seq.Max = stopSeq
					}
					tripStopSequences[tripId] = seq
				} else {
					tripStopSequences[tripId] = types.TripStopSequence{Min: stopSeq, Max: stopSeq}
				}
			}
		}

		// Parse and validate stop time
		stopTime := validations.ParseStopTimes(rawStopTime, i)

		if stopTime == (types.StopTime{}) {
			return nil
		}

		if stopTime.TripId != nil && *stopTime.TripId != "" && stopTime.StopSequence != nil {
			tripStopTimes[*stopTime.TripId] = append(tripStopTimes[*stopTime.TripId], stopTimesTypes.TimeSequenceStop{
				Row:           i,
				StopSequence:  *stopTime.StopSequence,
				ArrivalTime:   stopTime.ArrivalTime,
				DepartureTime: stopTime.DepartureTime,
			})
		}

		// Validate trip_id (using IdMap cache - no database query)
		validations.TripIdValidation(&stopTime, i, &gtfs)

		// Validate arrival_time (pass cached trip stop sequences)
		validations.ArrivalTimeValidation(&stopTime, i, &gtfs, stopTimesRules, tripStopSequences)

		// Validate departure_time
		validations.DepartureTimeValidation(&stopTime, i, &gtfs, stopTimesRules)

		// Validate stop_id (using IdMap cache and location_type cache - no database query)
		validations.StopIdValidation(&stopTime, i, &gtfs, stopLocationTypeCache)

		// Validate location_group_id
		validations.LocationGroupIdValidation(&stopTime, i, &gtfs)

		// Validate start_pickup_drop_off_window
		validations.StartPickupDropOffWindowValidation(&stopTime, i, stopTimesRules)

		// Validate end_pickup_drop_off_window
		validations.EndPickupDropOffWindowValidation(&stopTime, i, stopTimesRules)

		// Validate pickup_type
		validations.PickupTypeValidation(&stopTime, i, stopTimesRules)

		// Validate stop_headsign
		validations.StopHeadsignValidation(&stopTime, i, stopTimesRules)

		// Validate continuous_drop_off
		validations.ContinuousDropOffValidation(&stopTime, i, stopTimesRules)

		// Validate continuous_pickup
		validations.ContinuousPickupValidation(&stopTime, i, stopTimesRules)

		// Validate drop_off_type
		validations.DropOffTypeValidation(&stopTime, i, stopTimesRules)

		// Validate shape_dist_traveled
		validations.ShapeDistTraveledValidation(&stopTime, i, stopTimesRules)

		// Validate timepoint
		validations.TimepointValidation(&stopTime, i, stopTimesRules)

		// Validate pickup_booking_rule_id
		validations.PickupBookingRuleIdValidation(&stopTime, i, &gtfs, stopTimesRules)

		// Validate drop_off_booking_rule_id
		validations.DropOffBookingRuleIdValidation(&stopTime, i, &gtfs, stopTimesRules)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating stop times: %v", err))
	} else {
		// Need be run ArrivalDepartureTimeSequenceValidation here because it needs to be run after all rows are processed
		validations.ArrivalDepartureTimeSequenceValidation(tripStopTimes, stopTimesRules)

		lib.AppLogger.Info(fmt.Sprintf("Completed stop_times.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
