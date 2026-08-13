package trips

import (
	"main/types"
)

/*
Orchestrates pattern group validations to avoid duplicate errors.
Runs validations in optimal order and coordinates reporting between
route_id, direction_id, pattern_id, and shape_id group validators.
*/

func ValidatePatternGroups(
	tripsGroupedByPattern types.TripGroupedByPattern,
	tripsGroupedByShapeId types.TripGroupedByShapeId,
	gtfs *types.Gtfs,
	rules *types.TripsRules,
) {
	PatternIdGroupValidation(tripsGroupedByPattern, gtfs, rules)
	RouteIdGroupValidation(tripsGroupedByPattern, gtfs, rules)
	DirectionIdGroupValidation(tripsGroupedByPattern, gtfs, rules)
	ShapeIdGroupValidation(tripsGroupedByPattern, tripsGroupedByShapeId, gtfs, rules)
	TripHeadsignGroupValidation(tripsGroupedByPattern, gtfs, rules)
}
