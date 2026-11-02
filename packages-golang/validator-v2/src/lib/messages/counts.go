package messages

// TotalErrors returns the number of distinct error diagnostics.
func (service *MessageService) TotalErrors() int {
	//

	//
	// 1. Read the counter under the collection lock

	service.mu.RLock()
	defer service.mu.RUnlock()
	return service.errorCount
}

// TotalWarnings returns the number of distinct warning diagnostics.
func (service *MessageService) TotalWarnings() int {
	//

	//
	// 1. Read the counter under the collection lock

	service.mu.RLock()
	defer service.mu.RUnlock()
	return service.warningCount
}

// RuleIssueCount counts all info, warning, and error findings before deduplication.
// Findings are counted under their emitted rule ID.
func (service *MessageService) RuleIssueCount(id string) uint64 {
	//

	//
	// 1. Read the counter for the requested rule ID

	service.mu.RLock()
	defer service.mu.RUnlock()
	return service.issues[id]
}

// LimitReached lets the runner decide when to stop and write its report.
// A nonpositive limit disables the check; collection never exits the process.
func (service *MessageService) LimitReached(limit int) bool {
	//

	//
	// 1. Compare one consistent snapshot of the report counters

	service.mu.RLock()
	defer service.mu.RUnlock()
	return limit > 0 && service.errorCount+service.warningCount >= limit
}
