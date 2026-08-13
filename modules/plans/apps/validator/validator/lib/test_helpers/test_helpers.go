package test_helpers

import (
	"main/types"
	"testing"
)

// TestMessageServiceInterface is the interface for test message services
// This avoids import cycles by not importing services directly
type TestMessageServiceInterface interface {
	AddMessage(message types.Message)
	AddMessages(messages []types.Message)
	GetSummary() types.Summary
	Clear()
}

// CreateTestGtfsRules creates a test GtfsRules with default values
func CreateTestGtfsRules() *types.GtfsRules {
	return &types.GtfsRules{
		Agency:        types.AgencyRules{},
		Stops:         types.StopsRules{},
		Routes:        types.RoutesRules{},
		Trips:         types.TripsRules{},
		StopTimes:     types.StopTimesRules{},
		Calendar:      types.CalendarRules{},
		CalendarDates: types.CalendarDatesRules{},
	}
}

// AssertValidationError checks if the expected number of errors occurred
func AssertValidationError(t *testing.T, ms TestMessageServiceInterface, expectedErrors int, message string) {
	t.Helper()
	summary := ms.GetSummary()
	if summary.TotalErrors != expectedErrors {
		t.Errorf("%s: Expected %d errors, got %d", message, expectedErrors, summary.TotalErrors)
	}
}

// AssertValidationWarning checks if the expected number of warnings occurred
func AssertValidationWarning(t *testing.T, ms TestMessageServiceInterface, expectedWarnings int, message string) {
	t.Helper()
	summary := ms.GetSummary()
	if summary.TotalWarnings != expectedWarnings {
		t.Errorf("%s: Expected %d warnings, got %d", message, expectedWarnings, summary.TotalWarnings)
	}
}

// AssertNoValidationIssues checks that there are no errors or warnings
func AssertNoValidationIssues(t *testing.T, ms TestMessageServiceInterface, message string) {
	t.Helper()
	summary := ms.GetSummary()
	if summary.TotalErrors > 0 || summary.TotalWarnings > 0 {
		t.Errorf("%s: Expected no issues, got %d errors and %d warnings", message, summary.TotalErrors, summary.TotalWarnings)
	}
}

// AssertMessageCount checks the total number of messages (errors + warnings)
func AssertMessageCount(t *testing.T, ms TestMessageServiceInterface, expectedCount int, message string, severity types.Severity) {
	t.Helper()
	summary := ms.GetSummary()
	total := summary.TotalErrors + summary.TotalWarnings
	if severity == types.SEVERITY_ERROR {
		total = summary.TotalErrors
	} else {
		total = summary.TotalWarnings
	}
	if total != expectedCount {
		t.Errorf("%s: Expected %d total messages, got %d (errors: %d, warnings: %d)",
			message, expectedCount, total, summary.TotalErrors, summary.TotalWarnings)
	}
}

// AssertMessageContains checks if any message contains the given text
func AssertMessageContains(t *testing.T, ms TestMessageServiceInterface, containsText string, message string) {
	t.Helper()
	summary := ms.GetSummary()
	for _, msg := range summary.Messages {
		if msg.Message == containsText {
			return // Found it
		}
	}
	t.Errorf("%s: Expected to find message containing '%s', but no such message found", message, containsText)
}

// verifyIdMapStructure is a helper function to validate IdMap structure
func verifyMapStructure(t *testing.T, gtfs *types.Gtfs, entityType, id string, expectedRows []int, funcName string) {
	t.Helper()

	if gtfs == nil || gtfs.IdMap == nil {
		t.Errorf("%s: IdMap should not be nil", funcName)
		return
	}

	entityMap, exists := gtfs.IdMap[entityType]
	if !exists {
		t.Errorf("%s: entityType '%s' should exist in IdMap", funcName, entityType)
		return
	}

	rows, exists := entityMap[id]
	if !exists {
		t.Errorf("%s: id '%s' should exist in IdMap for entityType '%s'", funcName, id, entityType)
		return
	}

	if len(rows) != len(expectedRows) {
		t.Errorf("%s: expected %d row(s), got %d", funcName, len(expectedRows), len(rows))
		return
	}

	for i, expectedRow := range expectedRows {
		if rows[i] != expectedRow {
			t.Errorf("%s: expected row %d at index %d, got %d", funcName, expectedRow, i, rows[i])
		}
	}
}
