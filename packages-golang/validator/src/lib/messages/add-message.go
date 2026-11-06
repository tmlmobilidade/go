package messages

import (
	"slices"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib/messages/severity"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
)

// AddMessage resolves severity, converts row indexes, and merges repeated diagnostics.
// Input rows are copied so reporting never changes the caller's data.
func (service *MessageService) AddMessage(message types.Message) {
	//

	//
	// 1. Apply configuration and suppress ignored findings

	if !message.SeverityResolved {
		message.Severity = severity.ResolveMessageSeverity(message.RuleID, message.Severity)
	}
	if message.Severity == rules.SEVERITY_FORBIDDEN {
		message.Severity = rules.SEVERITY_ERROR
	}
	if message.Severity == rules.SEVERITY_IGNORE {
		return
	}

	//
	// 2. Copy source indexes and convert them to CSV line numbers

	message.Rows = slices.Clone(message.Rows)
	for index := range message.Rows {
		message.Rows[index] += 2 // Header line plus zero-based indexing.
	}

	//
	// 3. Count every finding before deduplication for dependency decisions

	service.mu.Lock()
	defer service.mu.Unlock()
	if message.Severity == rules.SEVERITY_ERROR || message.Severity == rules.SEVERITY_WARNING || message.Severity == rules.SEVERITY_INFO {
		if service.issues == nil {
			service.issues = make(map[string]uint64)
		}
		service.issues[message.RuleID]++
	}

	//
	// 4. Merge identical diagnostics, retaining the first 49 rows and latest row

	for index, existing := range service.messages {
		if existing.Message == message.Message && existing.FileName == message.FileName && existing.RuleID == message.RuleID && existing.Field == message.Field && existing.Severity == message.Severity {
			service.messages[index].Rows = retainedRows(append(existing.Rows, message.Rows...))
			return
		}
	}
	message.Rows = retainedRows(message.Rows)
	service.messages = append(service.messages, message)

	//
	// 5. Count distinct error and warning diagnostics for the report

	switch message.Severity {
	case rules.SEVERITY_ERROR:
		service.errorCount++
	case rules.SEVERITY_WARNING:
		service.warningCount++
	}
}

// retainedRows bounds the displayed sample while preserving the latest occurrence.
func retainedRows(rows []int) []int {
	if len(rows) > 50 {
		rows[49] = rows[len(rows)-1]
		return slices.Clone(rows[:50])
	}
	return rows
}
