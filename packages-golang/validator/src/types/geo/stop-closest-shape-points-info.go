package geo_types

type StopClosestShapePointsInfo struct {
	ShapeID           string
	DistanceMeters    float64
	ClosestShapePtLat float64
	ClosestShapePtLon float64
	ClosestShapePtSeq int
}
