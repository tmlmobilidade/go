package types

import "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"

// MessageAdder receives validation findings without coupling contexts to a service.
// Implementations shared between concurrent checks must synchronize their writes.
type MessageAdder interface {
	AddMessage(message messages.Message)
}
