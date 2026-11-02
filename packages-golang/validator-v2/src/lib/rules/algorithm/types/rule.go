package types

// Rule is a validation node in the dependency graph.
// ID should match the rule key used in rules.json (e.g. "agency_id_unique").
type Rule[T any] struct {
	ID        string
	DependsOn []string
	Run       func(row T) Status
}
