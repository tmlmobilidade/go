package services

import (
	"encoding/json"
	"slices"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

// MaxDetails limits sampled messages per rule and rows per sampled message.
const MaxDetails = 100

type messageKey struct {
	text, translation string
}

type sourceRow struct {
	file string
	line int
}

type group struct {
	result         types.RuleResult
	rows           map[sourceRow]struct{}
	messageIndexes map[messageKey]int
}

// ReportService collects diagnostics for one validation run. Use it from one goroutine.
type ReportService struct {
	groups map[string]*group
}

func NewReport() *ReportService {
	return &ReportService{groups: make(map[string]*group)}
}

// Add groups diagnostics by rule, omits ignored findings, and converts row
// indexes to CSV line numbers (the header occupies line one).
func (s *ReportService) Add(ruleID string, finding types.Finding) {
	if finding.Severity == types.SEVERITY_IGNORE {
		return
	}
	rows := append([]int{}, finding.Rows...)
	slices.Sort(rows)
	rows = slices.Compact(rows)
	encodedTranslation, _ := json.Marshal(finding.MessageTranslation)
	message := messageKey{finding.Message, string(encodedTranslation)}
	severity := finding.Severity
	if severity == types.SEVERITY_FORBIDDEN {
		severity = types.SEVERITY_ERROR
	}

	g := s.groups[ruleID]
	if g == nil {
		g = &group{result: types.RuleResult{
			Description:            finding.Description,
			DescriptionTranslation: finding.DescriptionTranslation.Clone(),
			Messages:               []types.Message{},
			RuleID:                 ruleID,
			Severity:               severity,
		}, rows: make(map[sourceRow]struct{}), messageIndexes: make(map[messageKey]int)}
		s.groups[ruleID] = g
	}
	if severity == types.SEVERITY_ERROR || (severity == types.SEVERITY_WARNING && g.result.Severity == types.SEVERITY_INFO) {
		g.result.Severity = severity
	}
	for i := range rows {
		rows[i] += 2
		g.rows[sourceRow{finding.FileName, rows[i]}] = struct{}{}
	}
	rows = rows[:min(len(rows), MaxDetails)]
	index, exists := g.messageIndexes[message]
	if exists {
		detail := &g.result.Messages[index]
		mergedRows := append(detail.Rows, rows...)
		slices.Sort(mergedRows)
		mergedRows = slices.Compact(mergedRows)
		detail.Rows = mergedRows[:min(len(mergedRows), MaxDetails)]
	} else if len(g.result.Messages) < MaxDetails {
		g.messageIndexes[message] = len(g.result.Messages)
		g.result.Messages = append(g.result.Messages, types.Message{
			Message:     finding.Message,
			Rows:        slices.Clone(rows),
			Translation: finding.MessageTranslation.Clone(),
		})
	}
}

// Summary returns an independent snapshot in stable rule ID order.
func (s *ReportService) Summary() types.Summary {
	summary := types.Summary{Results: make([]types.RuleResult, 0, len(s.groups))}
	for _, g := range s.groups {
		result := g.result
		switch result.Severity {
		case types.SEVERITY_ERROR:
			summary.Totals.Errors++
		case types.SEVERITY_WARNING:
			summary.Totals.Warnings++
		case types.SEVERITY_INFO:
			summary.Totals.Infos++
		}
		result.TotalRows = len(g.rows)
		result.DescriptionTranslation = result.DescriptionTranslation.Clone()
		result.Messages = slices.Clone(result.Messages)
		for i := range result.Messages {
			result.Messages[i].Rows = slices.Clone(result.Messages[i].Rows)
			result.Messages[i].Translation = result.Messages[i].Translation.Clone()
		}
		summary.Results = append(summary.Results, result)
	}
	slices.SortFunc(summary.Results, func(a, b types.RuleResult) int { return strings.Compare(a.RuleID, b.RuleID) })
	return summary
}
