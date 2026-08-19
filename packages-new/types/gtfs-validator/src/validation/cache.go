package types

// TripStopSequence holds min/max stop sequence for a trip
// Used for caching trip stop sequence information to avoid N+1 queries
type TripStopSequence struct {
	Min int
	Max int
}
