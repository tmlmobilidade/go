package messages

import (
	"slices"
	"strings"

	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables"
	messageutils "github.com/tmlmobilidade/go/packages-golang/validator-example/src/utils/messages"
)

// groupedMessages collapses the messages into one entry per rule, so the output has
// a single line per rule carrying its generic sentence, with its informational
// messages, warnings, and errors kept together in one array.
//
// Input is expected to be sortedMessages output, whose file_name then rule_id ordering
// the groups inherit by keeping the order in which each rule first appears.
func groupedMessages(messages []types.Message) []types.RuleMessage {
	//

	//
	// 1. Initialize the grouped messages map

	grouped := []types.RuleMessage{}
	indexByKey := map[string]int{}
	fieldsByKey := map[string][]string{}
	rowsByKey := map[string]map[int]bool{}

	//
	// 2. Group findings by file and rule, tracking fields, rows, and highest severity

	for _, message := range messages {
		key := message.FileName + "::" + message.RuleID

		index, found := indexByKey[key]
		if !found {
			index = len(grouped)
			indexByKey[key] = index
			grouped = append(grouped, types.RuleMessage{
				Messages: []types.Message{},
				FileName: message.FileName,
				Message:  messageutils.GenericRuleMessage(message.RuleID),
				RuleID:   message.RuleID,
				Severity: message.Severity,
			})
			rowsByKey[key] = map[int]bool{}
		}

		group := &grouped[index]
		group.Messages = append(group.Messages, message)

		if !slices.Contains(fieldsByKey[key], message.Field) {
			fieldsByKey[key] = append(fieldsByKey[key], message.Field)
		}

		for _, row := range message.Rows {
			rowsByKey[key][row] = true
		}

		if variables.SeverityRank[message.Severity] > variables.SeverityRank[group.Severity] {
			group.Severity = message.Severity
		}
	}

	//
	// 3. Finalize the group fields and retained row counts

	for key, index := range indexByKey {
		grouped[index].Field = strings.Join(fieldsByKey[key], ", ")
		grouped[index].TotalRows = len(rowsByKey[key])
	}

	//
	// 4. Return the grouped messages

	return grouped
}
