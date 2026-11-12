package algorithm_types

// Completion carries one worker's result back to the rule coordinator.
type Completion struct {
	Index  int    // Position of the completed rule in Manager.Ordered
	Status Status // Final outcome reported by its callback
}
