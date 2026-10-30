package types

type StopClosestShapePointsInfo struct {
	ShapeID           string
	DistanceMeters    float64
	ClosestShapePtLat float64
	ClosestShapePtLon float64
	ClosestShapePtSeq int
}

type StopCoordinatesValidation struct {
	StopId  string
	StopLat string
	StopLon string
}

type ShapeCoordinatesValidation struct {
	ShapeId    string
	ShapePtLat string
	ShapePtLon string
	ShapePtSeq string
}

type Coordinates struct {
	Lat float64
	Lng float64
}
