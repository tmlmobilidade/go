package messages

// MessageService describes the collection operations used by validation callers.
type MessageService interface {
	MessageAdder
	GetSummary() Summary
}
