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
	runner, dagErr := services.NewRuleRunner(gtfs, rules, "trips")
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
	tripsGroupedByRouteId := make(types.TripGroupedByRouteId)

	err := gtfs.IterateTrips(func(i int, rawTrips types.TripRaw) error {
		tracker.Track()
		trip := validations.ParseTrips(rawTrips, i)

		if trip == (types.Trip{}) {
			return nil
		}

		// Validate trip_id
		var groupHash string
		statuses := runner.Run(services.RuleActions{
			"trip_id_unique": func() { validations.TripIdValidation(&trip, i, &gtfs, rules.Rule("trip_id_unique")) },
			"trips_shape_id_references_shapes_table_when_present": func() {
				validations.ShapeIdValidation(&trip, i, &gtfs, rules.Rule("trips_shape_id_references_shapes_table_when_present"))
			},
			"trips_route_id_references_routes_table": func() {
				validations.RouteIdValidation(&trip, i, &gtfs, routeRowsCache, rules.Rule("trips_route_id_references_routes_table"))
			},
			"trips_service_id_references_calendar_service": func() {
				validations.ServiceIdValidation(&trip, i, &gtfs, calendarRowsCache, calendarDatesRowsCache, rules.Rule("trips_service_id_references_calendar_service"))
			},
			"trip_headsign_present_when_short_name_absent": func() {
				validations.TripHeadsignValidation(&trip, i, &gtfs, rules.Rule("trip_headsign_present_when_short_name_absent"))
			},
			"trip_short_name_exclusivity": func() {
				validations.TripShortNameValidation(&trip, i, &gtfs, rules.Rule("trip_short_name_exclusivity"))
			},
			"trips_direction_id_valid_enum": func() {
				validations.DirectionIdValidation(&trip, i, &gtfs, rules.Rule("trips_direction_id_valid_enum"))
			},
			"trips_block_id_in_allowed_set": func() {
				validations.BlockIdValidation(&trip, i, &gtfs, rules.Rule("trips_block_id_in_allowed_set"))
			},
			"trips_wheelchair_accessible_valid_gtfs_enum": func() {
				validations.WheelchairAccessibleValidation(&trip, i, &gtfs, rules.Rule("trips_wheelchair_accessible_valid_gtfs_enum"))
			},
			"trips_bikes_allowed_valid_gtfs_enum": func() {
				validations.BikesAllowedValidation(&trip, i, &gtfs, rules.Rule("trips_bikes_allowed_valid_gtfs_enum"))
			},
			"trip_path_stop_coordinates_referenced_from_stops": func() {
				validations.StopCoordinatesByTripIdValidation(&trip, i, &gtfs, tripStopTimesCache, stopsCache, stopClosestShapePointsCache, rules.Rule("trip_path_stop_coordinates_referenced_from_stops"))
			},
			"trips_direction_id_matches_feed_pattern_direction": func() {
				validations.DirectionPatternIdMatchValidation(&trip, i, &gtfs, rules.Rule("trips_direction_id_matches_feed_pattern_direction"))
			},
			"trip_id_limit_max_length": func() {
				validations.TripIdLimitCharactersValidation(&trip, i, &gtfs, rules.Rule("trip_id_limit_max_length"))
			},
			"trips_pattern_id_matches_feed_pattern_id_syntax": func() {
				validations.PatternIdFormatValidation(&trip, i, &gtfs, rules.Rule("trips_pattern_id_matches_feed_pattern_id_syntax"))
			},
			"trips_pattern_id_needs_to_be_the_same_as_shape_id": func() {
				validations.PatternIdSameShapeIdValidation(&trip, i, &gtfs, rules.Rule("trips_pattern_id_needs_to_be_the_same_as_shape_id"))
			},
			"trips_shape_id_matches_route_id_and_direction_id": func() {
				validations.ShapeIdRouteDirectionMatchValidation(&trip, i, &gtfs, rules.Rule("trips_shape_id_matches_route_id_and_direction_id"))
			},
			"trips_stop_sequence_increasing_by_one_along_trip": func() {
				groupHash = validations.StopSequenceValidation(&trip, i, &gtfs, rules.Rule("trips_stop_sequence_increasing_by_one_along_trip"), tripStopTimesCache)
			},
			"trips_pattern_id_present_and_references_consistent": func() {
				validations.PatternIdValidation(&trip, i, &gtfs, rules.Rule("trips_pattern_id_present_and_references_consistent"))
			},
		}, nil)

		if trip.RouteId != nil {
			group := tripsGroupedByRouteId[*trip.RouteId]
			group.Trips = append(group.Trips, trip)
			tripsGroupedByRouteId[*trip.RouteId] = group
			groupStatuses["route/"+*trip.RouteId] = services.MergeRuleStatuses(groupStatuses["route/"+*trip.RouteId], statuses)
		}

		if trip.PatternId != nil {
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

	validations.ValidateRouteGroups(tripsGroupedByRouteId, &gtfs, rules, runner, groupStatuses)

	validations.ValidatePatternGroups(tripsGroupedByPattern, tripsGroupedByShapeId, &gtfs, rules, runner, groupStatuses)
}
