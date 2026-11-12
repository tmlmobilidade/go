package geo_types

type ShapeSegmentDistanceViolation struct {
	ShapeID              string
	PreviousSequence     int
	CurrentSequence      int
	Row                  int
	PreviousLat          float64
	PreviousLon          float64
	CurrentLat           float64
	CurrentLon           float64
	RecordedDeltaMeters  float64
	ActualDistanceMeters float64
}
