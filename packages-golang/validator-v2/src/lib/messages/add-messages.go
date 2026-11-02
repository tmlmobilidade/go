package messages

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
)

// AddMessages sends each finding through the same policy and collection path.
func (service *MessageService) AddMessages(messages []types.Message) {
	//

	//
	// 1. Collect each finding

	for _, message := range messages {
		service.AddMessage(message)
	}
}
