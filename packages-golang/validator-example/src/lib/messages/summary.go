package messages

import (
	"slices"

	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/messages"
)

// AllMessages returns the details from every rule group in report order.
func AllMessages(summary types.Summary) []types.Message {
	//
	// 1. Flatten the grouped findings

	messages := []types.Message{}
	for _, rule := range summary.Messages {
		messages = append(messages, rule.Messages...)
	}
	return messages
}

// GetSummary returns an independent snapshot, sorted and grouped by file and rule.
func (service *MessageService) GetSummary() types.Summary {
	//

	//
	// 1. Copy findings and counters while holding the read lock

	service.mu.RLock()
	messages := make([]types.Message, len(service.messages))
	copy(messages, service.messages)
	for index := range messages {
		messages[index].Rows = slices.Clone(messages[index].Rows)
	}
	errors, warnings := service.errorCount, service.warningCount
	service.mu.RUnlock()

	//
	// 2. Build the report outside the collection lock

	return types.Summary{
		Messages:      groupedMessages(sortedMessages(messages)),
		TotalErrors:   errors,
		TotalWarnings: warnings,
	}
}
