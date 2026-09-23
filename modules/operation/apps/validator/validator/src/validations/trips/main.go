package trips

import (
	"fmt"
	"main/config"
	"main/lib"
	ruleset "main/lib/rules"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/trips/validations"
	"slices"
)

func init() {
	registry.Register("trips", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	var section *types.TripsRules
	if rules != nil {
		section = &rules.Trips
	}
	runner, dagErr := services.NewRuleRunner(gtfs, section)
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	groupStatuses := map[string]map[string]ruleset.Status{}
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
		var groupHash string
		var hasPatternId bool
		statuses := runner.Run(services.RuleActions{
			"trip_id_unique": func() { validations.TripIdValidation(&trip, i, &gtfs) },
			"shape_id_references_shapes_table_when_present": func() { validations.ShapeIdValidation(&trip, i, &gtfs, tripRules, tripStopTimesCache, routeRowsCache) },
			"route_id_references_routes_table":              func() { validations.RouteIdValidation(&trip, i, &gtfs, routeRowsCache) },
			"service_id_references_calendar_service":        func() { validations.ServiceIdValidation(&trip, i, &gtfs, calendarRowsCache, calendarDatesRowsCache) },
			"trip_headsign_present_when_short_name_absent":  func() { validations.TripHeadsignValidation(&trip, i, &gtfs, tripRules) },
			"trip_short_name_exclusivity":                   func() { validations.TripShortNameValidation(&trip, i, &gtfs, tripRules) },
			"direction_id_valid_enum":                       func() { validations.DirectionIdValidation(&trip, i, &gtfs, tripRules) },
			"block_id_in_allowed_set":                       func() { validations.BlockIdValidation(&trip, i, &gtfs, tripRules) },
			"wheelchair_accessible_valid_gtfs_enum":         func() { validations.WheelchairAccessibleValidation(&trip, i, &gtfs, tripRules) },
			"bikes_allowed_valid_gtfs_enum":                 func() { validations.BikesAllowedValidation(&trip, i, &gtfs, tripRules) },
			"trip_path_stop_coordinates_referenced_from_stops": func() {
				validations.StopCoordinatesByTripIdValidation(&trip, i, &gtfs, tripStopTimesCache, stopsCache, stopClosestShapePointsCache, tripRules)
			},
			"direction_id_matches_feed_pattern_direction":  func() { validations.DirectionPatternIdMatchValidation(&trip, i, &gtfs, tripRules) },
			"trip_id_limit_max_length":                     func() { validations.TripIdLimitCharactersValidation(&trip, i, &gtfs, tripRules) },
			"pattern_id_matches_feed_pattern_id_syntax":    func() { validations.PatternIdFormatValidation(&trip, i, &gtfs, tripRules) },
			"shape_id_needs_to_be_the_same_as_pattern_id":  func() { validations.ShapeIdSamePatternIdValidation(&trip, i, &gtfs, tripRules) },
			"stop_sequence_increasing_by_one_along_trip":   func() { groupHash = validations.StopSequenceValidation(&trip, i, &gtfs, tripRules, tripStopTimesCache) },
			"pattern_id_present_and_references_consistent": func() { hasPatternId = validations.PatternIdValidation(&trip, i, &gtfs, tripRules) },
		}, nil)

		if hasPatternId && trip.PatternId != nil {
			group := tripsGroupedByPattern[*trip.PatternId]
			group.Trips = append(group.Trips, trip)
			if !slices.Contains(group.Hash, groupHash) {
				group.Hash = append(group.Hash, groupHash)
			}
			tripsGroupedByPattern[*trip.PatternId] = group
			groupStatuses["pattern/"+*trip.PatternId] = services.MergeRuleStatuses(groupStatuses["pattern/"+*trip.PatternId], statuses)
		}
		if trip.ShapeId != nil {
			group := tripsGroupedByShapeId[*trip.ShapeId]
			group.Trips = append(group.Trips, trip)
			tripsGroupedByShapeId[*trip.ShapeId] = group
			groupStatuses["shape/"+*trip.ShapeId] = services.MergeRuleStatuses(groupStatuses["shape/"+*trip.ShapeId], statuses)
		}

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

	for patternID, group := range tripsGroupedByPattern {
		patterns := types.TripGroupedByPattern{patternID: group}
		runner.Run(services.RuleActions{
			"pattern_id_trip_has_required_fields_for_grouping": func() {
				validations.PatternIdGroupRuleValidation(patterns, &gtfs, tripsRules, "pattern_id_trip_has_required_fields_for_grouping")
			},
			"pattern_id_single_trip_signature_per_pattern": func() {
				validations.PatternIdGroupRuleValidation(patterns, &gtfs, tripsRules, "pattern_id_single_trip_signature_per_pattern")
			},
			"route_id_consistent_for_all_patterns_in_trips":      func() { validations.RouteIdGroupValidation(patterns, &gtfs, tripsRules) },
			"direction_id_consistent_for_all_patterns_in_trips":  func() { validations.DirectionIdGroupValidation(patterns, &gtfs, tripsRules) },
			"one_shape_id_per_pattern_id_group":                  func() { validations.ShapeIdGroupValidation(patterns, nil, &gtfs, tripsRules) },
			"trip_headsign_consistent_for_all_patterns_in_trips": func() { validations.TripHeadsignGroupValidation(patterns, &gtfs, tripsRules) },
		}, groupStatuses["pattern/"+patternID])
	}
	for shapeID, group := range tripsGroupedByShapeId {
		runner.Run(services.RuleActions{
			"one_pattern_id_per_shape_id_group": func() {
				validations.ShapeIdGroupValidation(nil, types.TripGroupedByShapeId{shapeID: group}, &gtfs, tripsRules)
			},
		}, groupStatuses["shape/"+shapeID])
	}
}
