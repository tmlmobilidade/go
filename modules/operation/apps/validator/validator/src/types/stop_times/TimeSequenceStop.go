package stop_times

// TimeSequenceStop contains the fields required to compare a stop_time with
// the previous stop in the same trip.
type TimeSequenceStop struct {
	Row           int
	StopSequence  int
	ArrivalTime   *string
	DepartureTime *string
}
