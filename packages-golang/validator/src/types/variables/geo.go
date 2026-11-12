package variables

// Shared geometry thresholds are expressed in meters unless the name states otherwise.
const (
	EarthRadiusMeters                  = 6371000.0
	ShapeSegmentLengthMeters           = 50.0
	MaxShapePointDistanceMeters        = 1000.0
	ShapeDistanceKilometersThreshold   = 800.0
	MaxStopDistanceToShapeMeters       = 100.0
	DefaultShapeBlockToleranceMeters   = 200.0
	DefaultShapeSegmentToleranceMeters = 20.0
)
