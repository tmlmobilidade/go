package trips

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/types"
	registry "main/validations"
	validations "main/validations/trips/validations"
	"slices"
)

func init() {
	registry.Register("trips", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Trips Validations...")

	tripStopTimesCache := buildTripStopTimesCache(gtfs)
	stopsCache := buildStopsCoordinatesCache(gtfs)
	shapeChunkedCache := buildShapeChunkedCacheForTripShapes(gtfs)
	stopClosestShapePointsCache := buildStopClosestShapePointsViolationCache(
		gtfs, tripStopTimesCache, stopsCache, shapeChunkedCache,
	)

	// Caches for GetRowsById to avoid repeated DB queries (many trips share route_id and service_id)
	routeRowsCache := make(map[string][]int)
	calendarRowsCache := make(map[string][]int)
	calendarDatesRowsCache := make(map[string][]int)

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "trips", config.ProgressThresholdLarge)
	var tripsGroupedByPattern types.TripGroupedByPattern = make(types.TripGroupedByPattern)
	var tripsGroupedByShapeId types.TripGroupedByShapeId = make(types.TripGroupedByShapeId)

	err := gtfs.IterateTrips(func(i int, rawTrips types.TripRaw) error {
		tracker.Track()
		trip := validations.ParseTrips(rawTrips, i)

		if trip == (types.Trip{}) {
			return nil
		}

		var tripRules *types.TripsRules
		if rules != nil {
			tripRules = &rules.Trips
		}

		// Validate trip_id
		validations.TripIdValidation(&trip, i, &gtfs)

		// Validate shape_id (pass cached stop_times data and route cache)
		validations.ShapeIdValidation(&trip, i, &gtfs, tripRules, tripStopTimesCache, routeRowsCache)

		// Validate route_id (pass route cache)
		validations.RouteIdValidation(&trip, i, &gtfs, routeRowsCache)

		// Validate service_id (pass calendar caches)
		validations.ServiceIdValidation(&trip, i, &gtfs, calendarRowsCache, calendarDatesRowsCache)

		// Validate trip_headsign
		validations.TripHeadsignValidation(&trip, i, &gtfs, tripRules)

		// Validate trip_short_name
		validations.TripShortNameValidation(&trip, i, &gtfs, tripRules)

		// Validate direction_id
		validations.DirectionIdValidation(&trip, i, &gtfs, tripRules)

		// Validate block_id
		validations.BlockIdValidation(&trip, i, &gtfs, tripRules)

		// Validate wheelchair_accessible
		validations.WheelchairAccessibleValidation(&trip, i, &gtfs, tripRules)

		// Validate bikes_allowed
		validations.BikesAllowedValidation(&trip, i, &gtfs, tripRules)

		// Validate stop_times.stop_sequence (pass cached stop_times data)
		groupHash := validations.StopSequenceValidation(&trip, i, &gtfs, tripRules, tripStopTimesCache)

		// Validate stop_coordinates (pass precomputed stop-to-shape distance cache)
		validations.StopCoordinatesByTripIdValidation(&trip, i, &gtfs, tripStopTimesCache, stopsCache, stopClosestShapePointsCache, tripRules)

		// CMET SPECIFIC VALIDATIONS
		hasPatternId := validations.PatternIdValidation(&trip, i, &gtfs, tripRules)
		if hasPatternId {
			group := tripsGroupedByPattern[*trip.PatternId]
			group.Trips = append(group.Trips, trip)

			if !slices.Contains(group.Hash, groupHash) {
				group.Hash = append(group.Hash, groupHash)
			}

			tripsGroupedByPattern[*trip.PatternId] = group
		}

		// Validate direction_id matches pattern_id
		validations.DirectionPatternIdMatchValidation(&trip, i, &gtfs, tripRules)

		// Validate trip_id_limit_characters
		validations.TripIdLimitCharactersValidation(&trip, i, &gtfs, tripRules)

		// Validate pattern_id_format
		validations.PatternIdFormatValidation(&trip, i, &gtfs, tripRules)

		// Validate shape_id_same_pattern_id
		validations.ShapeIdSamePatternIdValidation(&trip, i, &gtfs, tripRules)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating trips: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed trips.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}

	var tripsRules *types.TripsRules
	if rules != nil {
		tripsRules = &rules.Trips
	}

	validations.ValidatePatternGroups(tripsGroupedByPattern, tripsGroupedByShapeId, &gtfs, tripsRules)
}
