package messages

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
)

// Clear resets the collector's findings and counters.
func (service *MessageService) Clear() {
	//

	//
	// 1. Reset all collection state under the write lock

	service.mu.Lock()
	defer service.mu.Unlock()
	service.issues = make(map[string]uint64)
	service.messages = []types.Message{}
	service.errorCount = 0
	service.warningCount = 0
}
