package lib

import (
	"fmt"
	"main/types"
)

// ProgressTracker handles progress tracking and logging for validation iterations
type ProgressTracker struct {
	tableName         string
	totalCount        int
	processedCount    int
	lastLoggedPercent int
	rowThreshold      int // Log every N rows when totalCount is unknown
	complete          bool
}

// NewProgressTracker creates a new progress tracker for a table
func NewProgressTracker(tableName string, totalCount int, rowThreshold int) *ProgressTracker {
	return &ProgressTracker{
		tableName:         tableName,
		totalCount:        totalCount,
		processedCount:    0,
		lastLoggedPercent: -1,
		rowThreshold:      rowThreshold,
	}
}

// Track increments the processed count and logs progress if needed
func (pt *ProgressTracker) Track() {
	if pt.complete {
		return
	}
	pt.processedCount++

	// Log progress every 10% or every rowThreshold rows (whichever comes first)
	if pt.totalCount > 0 {
		// Reaching the last row does not finish any remaining grouped checks.
		// Only Complete, called after the file's rules return, may report 100%.
		if pt.processedCount >= pt.totalCount {
			return
		}
		currentPercent := (pt.processedCount * 100) / pt.totalCount
		// Check if we've crossed a 10% milestone (e.g., from 9% to 10%, 19% to 20%, etc.)
		hasCrossed10Percent := currentPercent/10 > pt.lastLoggedPercent/10
		shouldLogRowThreshold := pt.processedCount%pt.rowThreshold == 0 && currentPercent != pt.lastLoggedPercent

		if hasCrossed10Percent || shouldLogRowThreshold {
			percent := min(99.9, float64(pt.processedCount)*100.0/float64(pt.totalCount))
			if hasCrossed10Percent {
				// Log at Info level for 10% milestones and completion
				AppLogger.Info(fmt.Sprintf("Validating %s: %d/%d (%.1f%%)", pt.tableName, pt.processedCount, pt.totalCount, percent))
			} else {
				// Log at Debug level for rowThreshold milestones
				AppLogger.Debug(fmt.Sprintf("Validating %s: %d/%d (%.1f%%)", pt.tableName, pt.processedCount, pt.totalCount, percent))
			}
			pt.lastLoggedPercent = currentPercent
		}
	} else if pt.processedCount%pt.rowThreshold == 0 {
		AppLogger.Debug(fmt.Sprintf("Validating %s: %d rows processed", pt.tableName, pt.processedCount))
	}
}

// Complete reports success only after every row and grouped check has finished.
// Error paths must not call it.
func (pt *ProgressTracker) Complete() {
	if pt.complete {
		return
	}
	pt.complete = true
	AppLogger.Info(fmt.Sprintf("Validating %s: %d/%d (100.0%%)", pt.tableName, pt.processedCount, pt.processedCount))
}

// GetProcessedCount returns the number of processed rows
func (pt *ProgressTracker) GetProcessedCount() int {
	return pt.processedCount
}

// GetTotalCount returns the total count
func (pt *ProgressTracker) GetTotalCount() int {
	return pt.totalCount
}

// CreateProgressTracker is a convenience function that creates a progress tracker
// by getting the table count from gtfs
func CreateProgressTracker(gtfs types.Gtfs, tableName string, rowThreshold int) *ProgressTracker {
	totalCount, err := gtfs.GetTableCount(tableName)
	if err != nil {
		AppLogger.Debug(fmt.Sprintf("Could not get table count for %s: %v", tableName, err))
		totalCount = 0
	}
	return NewProgressTracker(tableName, totalCount, rowThreshold)
}
