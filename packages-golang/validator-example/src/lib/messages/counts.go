package messages

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
