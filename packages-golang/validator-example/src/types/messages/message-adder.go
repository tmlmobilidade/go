package messages

// MessageAdder receives findings without coupling validation checks to their collector.
// Implementations shared between workers must synchronize writes.
type MessageAdder interface {
	AddMessage(message Message)
}
