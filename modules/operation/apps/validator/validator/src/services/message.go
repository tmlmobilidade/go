package services

import (
	"cmp"
	"encoding/json"
	"fmt"
	"main/i18n"
	"main/lib"
	ruleset "main/lib/rules"
	"main/types"
	"os"
	"slices"
	"strconv"
	"strings"
	"sync"

	"main/config"

	"github.com/olekukonko/tablewriter"
)

// MessageServiceInterface defines the interface for message service operations
// This allows for dependency injection and improved testability
type MessageServiceInterface interface {
	AddMessage(message types.Message)
	AddMessages(messages []types.Message)
	GetSummary() types.Summary
	TotalErrors() int
	TotalWarnings() int
	Clear()
}

// MessageService implements MessageServiceInterface
type MessageService struct {
	mu           sync.RWMutex
	issues       map[string]uint64
	errorCount   int
	warningCount int
	messages     []types.Message
}

func NewMessageService() *MessageService {
	return &MessageService{
		messages: []types.Message{},
		issues:   make(map[string]uint64),
	}
}

func (ms *MessageService) AddMessages(messages []types.Message) {
	for _, message := range messages {
		ms.AddMessage(message)
	}
}

func (ms *MessageService) AddMessage(message types.Message) {
	if severity, configured := ruleset.MessageSeverityOverride(message.FileName, message.RuleID, message.Field); configured {
		if severity == types.SEVERITY_IGNORE {
			return
		}
		message.Severity = severity
	}

	ms.mu.Lock()
	if message.Severity != types.SEVERITY_IGNORE {
		if ms.issues == nil {
			ms.issues = make(map[string]uint64)
		}
		ms.issues[message.RuleID]++
		ms.issues[message.RuleID+"/"+message.Field]++
	}

	// Add +2 to each row in the message.Rows
	// 1 for the header and 1 for the 0 based index
	for i, row := range message.Rows {
		message.Rows[i] = row + 2
	}

	for i, m := range ms.messages {
		if m.Message == message.Message && m.FileName == message.FileName && m.RuleID == message.RuleID && m.Severity == message.Severity {
			// Only keep up to 100 rows, keeping the latest row
			newRows := append(m.Rows, message.Rows...)
			if len(newRows) > 100 {
				lastRow := newRows[len(newRows)-1]
				limit := min(99, len(newRows))
				newRows = append(newRows[:limit], lastRow)
			}
			ms.messages[i].Rows = newRows
			ms.mu.Unlock()
			return
		}
	}

	ms.messages = append(ms.messages, message)

	switch message.Severity {
	case types.SEVERITY_ERROR:
		ms.errorCount++
	case types.SEVERITY_FORBIDDEN:
		ms.errorCount++
	case types.SEVERITY_WARNING:
		ms.warningCount++
	}

	totalIssues := ms.errorCount + ms.warningCount
	ms.mu.Unlock()

	// Exit if total errors + warnings exceeds TotalIssuesLimit
	if totalIssues >= config.TotalIssuesLimit {
		lib.AppLogger.Error("Too many issues (errors + warnings > " + strconv.Itoa(config.TotalIssuesLimit) + "). Exiting.")
		if AppCLI.Options.OutputPath != "" {
			if err := ms.WriteToFile(AppCLI.Options.OutputPath); err != nil {
				lib.AppLogger.Error(err.Error())
				os.Exit(1)
			}
		} else {
			ms.PrintJSON()
		}
		os.Exit(0)
	}
}

func (ms *MessageService) GetSummary() types.Summary {
	ms.mu.RLock()
	defer ms.mu.RUnlock()
	messages := slices.Clone(ms.messages)
	for i := range messages {
		messages[i].Rows = slices.Clone(messages[i].Rows)
	}
	messages = sortedMessages(messages)

	return types.Summary{
		Messages:      groupedMessages(messages),
		TotalErrors:   ms.errorCount,
		TotalWarnings: ms.warningCount,
	}
}

// severityRank orders severities so a rule that reported at more than one severity
// is summarised by the most serious one it produced.
var severityRank = map[types.Severity]int{
	types.SEVERITY_IGNORE:    0,
	types.SEVERITY_WARNING:   1,
	types.SEVERITY_FORBIDDEN: 2,
	types.SEVERITY_ERROR:     3,
}

// groupedMessages collapses the messages into one entry per rule, so the output has
// a single line per rule carrying its generic sentence, with the errors and warnings
// it stands for kept together in one array.
//
// Input is expected to be sortedMessages output, whose file_name then rule_id ordering
// the groups inherit by keeping the order in which each rule first appears.
func groupedMessages(messages []types.Message) []types.RuleMessage {
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

		if severityRank[message.Severity] > severityRank[group.Severity] {
			group.Severity = message.Severity
		}
	}

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
	key := ruleID + ".generic"
	if message := i18n.AppTranslator.Get(key); message != key {
		return message
	}

	return humanizeRuleID(ruleID)
}

// humanizeRuleID turns a rule id into a readable sentence by replacing the underscores
// with spaces and capitalising the first letter.
func humanizeRuleID(ruleID string) string {
	humanized := strings.ReplaceAll(ruleID, "_", " ")
	if humanized == "" {
		return ruleID
	}

	return strings.ToUpper(humanized[:1]) + humanized[1:]
}

func (ms *MessageService) TotalErrors() int {
	ms.mu.RLock()
	defer ms.mu.RUnlock()
	return ms.errorCount
}

func (ms *MessageService) TotalWarnings() int {
	ms.mu.RLock()
	defer ms.mu.RUnlock()
	return ms.warningCount
}

func sortedMessages(messages []types.Message) []types.Message {
	sorted := slices.Clone(messages)

	slices.SortStableFunc(sorted, func(a, b types.Message) int {
		if c := cmp.Compare(a.FileName, b.FileName); c != 0 {
			return c
		}
		if c := cmp.Compare(a.RuleID, b.RuleID); c != 0 {
			return c
		}
		if c := cmp.Compare(a.Severity, b.Severity); c != 0 {
			return c
		}
		if c := cmp.Compare(a.Message, b.Message); c != 0 {
			return c
		}
		return cmp.Compare(firstRow(a.Rows), firstRow(b.Rows))
	})

	return sorted
}

func firstRow(rows []int) int {
	if len(rows) == 0 {
		return 0
	}

	return rows[0]
}

func (ms *MessageService) PrintTable() {
	summary := ms.GetSummary()

	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader([]string{"Validation ID", "Message", "Severity", "Field", "File Name", "Row"})
	table.SetRowSeparator("-")
	table.SetFooter([]string{"", "", "Errors: " + strconv.Itoa(summary.TotalErrors), "Warnings: " + strconv.Itoa(summary.TotalWarnings), "Total: " + strconv.Itoa(summary.TotalErrors+summary.TotalWarnings), ""})
	// One line per rule with its generic sentence, followed by the messages it stands
	// for, so the table reads like the grouped output without losing the detail
	for _, rule := range summary.Messages {
		table.Append([]string{rule.RuleID, rule.Message, string(rule.Severity), rule.Field, rule.FileName, strconv.Itoa(rule.TotalRows) + " rows"})
		for _, message := range rule.Messages {
			rows := make([]string, len(message.Rows))
			for i, row := range message.Rows {
				rows[i] = strconv.Itoa(row)
			}
			table.Append([]string{"", "  " + message.Message, string(message.Severity), message.Field, message.FileName, strings.Join(rows, ", ")})
		}
	}
	table.Render()
}

func (ms *MessageService) PrintSummary() {
	summary := ms.GetSummary()
	fmt.Println("\n\n================================================")
	fmt.Println("GTFS Validation Summary")
	fmt.Println("================================================")
	fmt.Printf("Total Errors: %d\n", summary.TotalErrors)
	fmt.Printf("Total Warnings: %d\n", summary.TotalWarnings)
	fmt.Println("================================================")
}

func (ms *MessageService) PrintJSON() {
	lib.PrintMap(ms.GetSummary(), true)
}

func (ms *MessageService) WriteToFile(filename string) error {
	content, err := json.Marshal(ms.GetSummary())
	if err != nil {
		return fmt.Errorf("error marshalling summary to JSON: %w", err)
	}

	if err := os.WriteFile(filename, content, 0644); err != nil {
		return fmt.Errorf("error writing summary to %s: %w", filename, err)
	}

	return nil
}

func (ms *MessageService) Clear() {
	ms.mu.Lock()
	defer ms.mu.Unlock()
	ms.issues = make(map[string]uint64)
	ms.messages = []types.Message{}
	ms.errorCount = 0
	ms.warningCount = 0
}

var AppMessageService = NewMessageService()

// RuleIssueCount counts emissions before message deduplication. Counting only
// summary messages would miss a failing prerequisite on a subsequent row.
func (ms *MessageService) RuleIssueCount(entry ruleset.CatalogueEntry) uint64 {
	ms.mu.RLock()
	defer ms.mu.RUnlock()
	count := ms.issues[entry.ID]
	for _, id := range entry.OutputIDs {
		if id == entry.ID {
			continue
		}
		if entry.MessageField != "" {
			id += "/" + entry.MessageField
		}
		count += ms.issues[id]
	}
	return count
}
