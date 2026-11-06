package messages

import (
	"slices"
	"strings"

	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables/i18n"
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
	// 1. Group findings and track their fields, rows, and highest severity

	grouped := []types.RuleMessage{}
	indexByKey := map[string]int{}
	fieldsByKey := map[string][]string{}
	rowsByKey := map[string]map[int]bool{}

	for _, message := range messages {
		key := message.FileName + "::" + message.RuleID

		index, found := indexByKey[key]
		if !found {
			index = len(grouped)
			indexByKey[key] = index
			grouped = append(grouped, types.RuleMessage{
				Messages: []types.Message{},
				FileName: message.FileName,
				Message:  genericRuleMessage(message.RuleID),
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
	// 2. Finalize the group fields and retained row counts

	for key, index := range indexByKey {
		grouped[index].Field = strings.Join(fieldsByKey[key], ", ")
		grouped[index].TotalRows = len(rowsByKey[key])
	}

	return grouped
}

// genericRuleMessage returns the rule's generic sentence, used as the summary line
// that stands in for the rule's individual messages.
//
// Rules whose sentence has not been translated yet fall back to their humanised id,
// so a missing entry reads as a plain description instead of leaking a raw key.
func genericRuleMessage(ruleID string) string {
	//

	//
	// 1. Resolve a file notice or rule summary translation

	if table, found := strings.CutSuffix(ruleID, "_file_missing"); found {
		return i18n.AppTranslator.Get("file_missing.message", table+".txt")
	}
	key := ruleID + ".generic"
	if message := i18n.AppTranslator.Get(key); message != key {
		return message
	}

	return humanizeRuleID(ruleID)
}

// humanizeRuleID turns a rule id into a readable sentence by replacing the underscores
// with spaces and capitalising the first letter.
func humanizeRuleID(ruleID string) string {
	//

	//
	// 1. Turn the untranslated rule ID into a readable fallback

	humanized := strings.ReplaceAll(ruleID, "_", " ")
	if humanized == "" {
		return ruleID
	}

	return strings.ToUpper(humanized[:1]) + humanized[1:]
}
