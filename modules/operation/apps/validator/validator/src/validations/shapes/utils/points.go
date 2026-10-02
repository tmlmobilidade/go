package utils

import (
	"sort"

	"main/lib"
	"main/types"
)

// Point holds a shape point and its original source row for geometric checks.
type Point struct {
	ShapeID          string
	Row              int
	Sequence         int
	Coordinates      types.Coordinates
	ValidCoordinates bool
	Distance         *float64
}

// OrderedPoints groups points by shape and sorts them by sequence.
// It keeps invalid coordinates in the ordered list as barriers. Removing a point
// would invent a segment between its neighbours and could report a false gap.
// Missing/duplicate sequences make the order ambiguous; the sequence rules
// report those errors, so geometric checks skip that shape.
func OrderedPoints(shapes []types.Shape) [][]Point {
	groups := map[string][]Point{}
	invalidSequence := map[string]bool{}
	for i, shape := range shapes {
		if shape.ShapeId == nil || *shape.ShapeId == "" {
			continue
		}
		id := *shape.ShapeId
		if shape.ShapePtSequence == nil || *shape.ShapePtSequence < 0 {
			invalidSequence[id] = true
			continue
		}
		point := Point{ShapeID: id, Row: i, Sequence: *shape.ShapePtSequence, Distance: shape.ShapeDistTraveled}
		if shape.Row != nil {
			point.Row = *shape.Row
		}
		if shape.ShapePtLat != nil && shape.ShapePtLon != nil &&
			lib.ValidateLatitude(*shape.ShapePtLat) && lib.ValidateLongitude(*shape.ShapePtLon) {
			point.Coordinates = types.Coordinates{Lat: *shape.ShapePtLat, Lng: *shape.ShapePtLon}
			point.ValidCoordinates = true
		}
		groups[id] = append(groups[id], point)
	}
	ids := make([]string, 0, len(groups))
	for id := range groups {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	ordered := make([][]Point, 0, len(groups))
	for _, id := range ids {
		if invalidSequence[id] {
			continue
		}
		points := groups[id]
		sort.Slice(points, func(i, j int) bool { return points[i].Sequence < points[j].Sequence })
		for i := 1; i < len(points); i++ {
			if points[i].Sequence == points[i-1].Sequence {
				invalidSequence[id] = true
				break
			}
		}
		if !invalidSequence[id] {
			ordered = append(ordered, points)
		}
	}
	return ordered
}
