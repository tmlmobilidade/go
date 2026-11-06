package geo_types

type ShapeDistanceBlockViolation struct {
	ShapeID          string
	Row              int
	ExpectedMeters   float64
	ActualMeters     float64
	DifferenceMeters float64
}
