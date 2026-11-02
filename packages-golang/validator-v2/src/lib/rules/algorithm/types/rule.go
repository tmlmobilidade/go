package types

// Rule is a validation node in the dependency graph.
// ID should match the rule key used in rules.json (e.g. "agency_id_unique").
type Rule[T any] struct {
	ID        string             // Unique rule ID matching its rules.json key
	DependsOn []string           // Rule IDs that must all pass before this rule can run
	Run       func(row T) Status // Check to execute when dependencies pass and a worker is available
}
