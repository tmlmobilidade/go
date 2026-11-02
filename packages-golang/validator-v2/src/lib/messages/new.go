package messages

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
)

// NewMessageService creates an empty collector for one validation run.
// Pass it to validation contexts through the shared messages.MessageAdder interface.
func NewMessageService() *MessageService {
	//

	//
	// 1. Initialize message storage and per-rule issue counters

	return &MessageService{
		messages: []types.Message{},
		issues:   make(map[string]uint64),
	}
}
