package algorithm_types

// Manager stores registered rules and their validated dependency order.
// NewManager prepares validation nodes; use algorithm.Build for directly supplied nodes.
// Finish building before sharing the manager between validation workers.
type Manager[T any] struct {
	Rules   []Rule[T] // Registered rules, before dependency ordering
	Ordered []Rule[T] // Validated dependency order produced by Build
}
