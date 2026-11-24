package services

import (
	"encoding/json"
	"slices"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

// MaxDetails limits sampled messages per rule and rows per sampled message.
const MaxDetails = 100

type diagnosticKey struct {
	rule, file, field, message, rows string
	severity                         types.Severities
}

type sourceRow struct {
	file string
	line int
}

type group struct {
	result types.RuleResult
	rows   map[sourceRow]struct{}
}

// ReportService collects diagnostics for one validation run. Use it from one goroutine.
type ReportService struct {
	groups map[string]*group
	seen   map[diagnosticKey]struct{}
	totals types.Totals
}

func NewReport() *ReportService {
	return &ReportService{groups: make(map[string]*group), seen: make(map[diagnosticKey]struct{})}
}

// Add retains distinct diagnostics, omits ignored findings, and converts row
// indexes to CSV line numbers (the header occupies line one).
func (s *ReportService) Add(ruleID string, finding types.Finding) {
	if finding.Severity == types.SEVERITY_IGNORE {
		return
	}
	rows := append([]int{}, finding.Rows...)
	slices.Sort(rows)
	rows = slices.Compact(rows)
	encodedRows, _ := json.Marshal(rows)
	key := diagnosticKey{ruleID, finding.FileName, finding.Field, finding.Message, string(encodedRows), finding.Severity}
	if _, exists := s.seen[key]; exists {
		return
	}
	s.seen[key] = struct{}{}
	severity := finding.Severity
	switch severity {
	case types.SEVERITY_ERROR, types.SEVERITY_FORBIDDEN:
		s.totals.Errors++
		severity = types.SEVERITY_ERROR
	case types.SEVERITY_WARNING:
		s.totals.Warnings++
	case types.SEVERITY_INFO:
		s.totals.Infos++
	}

	g := s.groups[ruleID]
	if g == nil {
		g = &group{result: types.RuleResult{
			Description: finding.Description, Messages: []types.Message{}, RuleID: ruleID, Severity: severity,
		}, rows: make(map[sourceRow]struct{})}
		s.groups[ruleID] = g
	}
	if severity == types.SEVERITY_ERROR || (severity == types.SEVERITY_WARNING && g.result.Severity == types.SEVERITY_INFO) {
		g.result.Severity = severity
	}
	for i := range rows {
		rows[i] += 2
		g.rows[sourceRow{finding.FileName, rows[i]}] = struct{}{}
	}
	if len(g.result.Messages) < MaxDetails {
		g.result.Messages = append(g.result.Messages, types.Message{
			Message: finding.Message,
			Rows:    rows[:min(len(rows), MaxDetails)],
		})
	}
}

// Summary returns an independent snapshot in stable rule ID order.
func (s *ReportService) Summary() types.Summary {
	summary := types.Summary{Results: make([]types.RuleResult, 0, len(s.groups)), Totals: s.totals}
	for _, g := range s.groups {
		result := g.result
		result.TotalRows = len(g.rows)
		result.Messages = slices.Clone(result.Messages)
		for i := range result.Messages {
			result.Messages[i].Rows = slices.Clone(result.Messages[i].Rows)
		}
		summary.Results = append(summary.Results, result)
	}
	slices.SortFunc(summary.Results, func(a, b types.RuleResult) int { return strings.Compare(a.RuleID, b.RuleID) })
	return summary
}
