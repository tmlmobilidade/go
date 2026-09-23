package services

import (
	"cmp"
	"encoding/json"
	"fmt"
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
		Messages:      messages,
		TotalErrors:   ms.errorCount,
		TotalWarnings: ms.warningCount,
	}
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
	for _, message := range summary.Messages {
		rows := make([]string, len(message.Rows))
		for i, row := range message.Rows {
			rows[i] = strconv.Itoa(row)
		}
		table.Append([]string{message.RuleID, message.Message, string(message.Severity), message.Field, message.FileName, strings.Join(rows, ", ")})
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
