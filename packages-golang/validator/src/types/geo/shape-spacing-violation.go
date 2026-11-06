package geo_types

type ShapeSpacingViolation struct {
	ShapeID          string
	Row              int
	CurrentLat       float64
	CurrentLon       float64
	CurrentSequence  int
	PreviousLat      float64
	PreviousLon      float64
	PreviousSequence int
	DistanceMeters   float64
}
