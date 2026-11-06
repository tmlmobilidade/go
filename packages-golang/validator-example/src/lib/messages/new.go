package messages

// NewMessageService creates an empty collector for one validation run.
// Pass it to validation contexts through the shared messages.MessageAdder interface.
func NewMessageService() *MessageService {
	//

	//
	// 1. Create a collector; storage is allocated when findings arrive

	return &MessageService{}
}
