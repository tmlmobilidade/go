package services

import (
	"encoding/json"
	"slices"
	"sort"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

// MaxDetails limits sampled messages and rows per sampled message in each group.
const MaxDetails = 100

type groupKey struct {
	rule, file, field string
	severity          types.Severities
}

type group struct {
	message types.RuleMessage
	rows    map[int]struct{}
}

// ReportService collects diagnostics for one validation run. Use it from one goroutine.
type ReportService struct {
	groups           map[groupKey]*group
	seen             map[string]struct{}
	errors, warnings int
}

func NewReport() *ReportService {
	return &ReportService{groups: make(map[groupKey]*group), seen: make(map[string]struct{})}
}

// Add retains distinct diagnostics, omits ignored findings, and converts row
// indexes to CSV line numbers (the header occupies line one).
func (s *ReportService) Add(message types.Message, description string) {
	if message.Severity == types.SEVERITY_IGNORE {
		return
	}
	message.Rows = append([]int{}, message.Rows...)
	slices.Sort(message.Rows)
	message.Rows = slices.Compact(message.Rows)
	for i := range message.Rows {
		message.Rows[i] += 2
	}
	// SeverityResolved is deliberately excluded by the JSON tag.
	encoded, _ := json.Marshal(message)
	key := string(encoded)
	if _, exists := s.seen[key]; exists {
		return
	}
	s.seen[key] = struct{}{}
	switch message.Severity {
	case types.SEVERITY_ERROR, types.SEVERITY_FORBIDDEN:
		s.errors++
	case types.SEVERITY_WARNING:
		s.warnings++
	}
	k := groupKey{message.RuleID, message.FileName, message.Field, message.Severity}
	g := s.groups[k]
	if g == nil {
		g = &group{message: types.RuleMessage{
			Messages: []types.Message{}, Field: message.Field, FileName: message.FileName,
			Message: description, RuleID: message.RuleID, Severity: message.Severity,
		}, rows: make(map[int]struct{})}
		s.groups[k] = g
	}
	for _, row := range message.Rows {
		g.rows[row] = struct{}{}
	}
	if len(g.message.Messages) < MaxDetails {
		message.Rows = message.Rows[:min(len(message.Rows), MaxDetails)]
		g.message.Messages = append(g.message.Messages, message)
	}
}

// Summary returns an independent snapshot in stable rule/file/field/severity order.
func (s *ReportService) Summary() types.Summary {
	result := types.Summary{Messages: []types.RuleMessage{}, TotalErrors: s.errors, TotalWarnings: s.warnings}
	for _, g := range s.groups {
		message := g.message
		message.TotalRows = len(g.rows)
		message.Messages = slices.Clone(message.Messages)
		for i := range message.Messages {
			message.Messages[i].Rows = slices.Clone(message.Messages[i].Rows)
		}
		result.Messages = append(result.Messages, message)
	}
	sort.Slice(result.Messages, func(i, j int) bool {
		a, b := result.Messages[i], result.Messages[j]
		if a.RuleID != b.RuleID {
			return a.RuleID < b.RuleID
		}
		if a.FileName != b.FileName {
			return a.FileName < b.FileName
		}
		if a.Field != b.Field {
			return a.Field < b.Field
		}
		return a.Severity < b.Severity
	})
	return result
}
