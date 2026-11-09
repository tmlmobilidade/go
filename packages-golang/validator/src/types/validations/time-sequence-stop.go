package validations_types

// TimeSequenceStop retains a stop-time row and its usable arrival/departure values.
type TimeSequenceStop struct {
	Row           int
	StopSequence  int
	ArrivalTime   string
	DepartureTime string
}
