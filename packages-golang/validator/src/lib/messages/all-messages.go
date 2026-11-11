package messages

import types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/messages"

// AllMessages returns the details from every rule group in report order.
func AllMessages(summary types.Summary) []types.Message {
	messages := []types.Message{}
	for _, rule := range summary.Messages {
		messages = append(messages, rule.Messages...)
	}
	return messages
}
