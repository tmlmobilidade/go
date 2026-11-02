package messages

// MessageService describes the collection operations used by validation callers.
type MessageService interface {
	MessageAdder
	AddMessages(messages []Message)
	GetSummary() Summary
	TotalErrors() int
	TotalWarnings() int
	RuleIssueCount(id string) uint64
	LimitReached(limit int) bool
	Clear()
}
