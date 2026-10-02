package validations

import (
	"main/types"
	"sync"
)

// ValidationFunction is the signature for a validation function
type ValidationFunction func(gtfs types.Gtfs, rules *types.GtfsRules)

// Registry holds all registered validations
type Registry struct {
	validations map[string]ValidationFunction
	mu          sync.RWMutex
}

var globalRegistry = &Registry{
	validations: make(map[string]ValidationFunction),
}

// Register registers a validation function for a table name
func Register(tableName string, fn ValidationFunction) {
	globalRegistry.mu.Lock()
	defer globalRegistry.mu.Unlock()
	globalRegistry.validations[tableName] = fn
}

// Get retrieves a validation function for a table name
func Get(tableName string) (ValidationFunction, bool) {
	globalRegistry.mu.RLock()
	defer globalRegistry.mu.RUnlock()
	fn, ok := globalRegistry.validations[tableName]
	return fn, ok
}

// GetAll returns all registered validations
func GetAll() map[string]ValidationFunction {
	globalRegistry.mu.RLock()
	defer globalRegistry.mu.RUnlock()
	result := make(map[string]ValidationFunction)
	for k, v := range globalRegistry.validations {
		result[k] = v
	}
	return result
}

// GetRegisteredTables returns a list of all registered table names
func GetRegisteredTables() []string {
	globalRegistry.mu.RLock()
	defer globalRegistry.mu.RUnlock()
	tables := make([]string, 0, len(globalRegistry.validations))
	for table := range globalRegistry.validations {
		tables = append(tables, table)
	}
	return tables
}

