package logger

import (
	"fmt"
	"sync"

	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	loggerTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/logger"
)

// ProgressTracker counts finished rows. Complete is required after all checks
// finish; reaching the last row alone never reports completion.
type ProgressTracker struct {
	mu                                                          sync.Mutex
	logger                                                      *Logger
	tableName                                                   string
	totalCount, processedCount, lastLoggedPercent, rowThreshold int
	complete                                                    bool
}

func (l *Logger) NewProgressTracker(tableName string, totalCount, rowThreshold int) *ProgressTracker {
	return &ProgressTracker{logger: l, tableName: tableName, totalCount: max(0, totalCount),
		rowThreshold: max(1, rowThreshold), lastLoggedPercent: -1}
}

// Track is safe for workers processing rows concurrently.
func (p *ProgressTracker) Track() {
	p.mu.Lock()
	defer p.mu.Unlock()
	if p.complete {
		return
	}
	p.processedCount++
	if p.totalCount <= 0 {
		if p.processedCount%p.rowThreshold == 0 {
			p.emit("debug", false)
		}
		return
	}
	if p.processedCount >= p.totalCount {
		return
	}
	percent := p.processedCount * 100 / p.totalCount
	milestone := percent/10 > p.lastLoggedPercent/10
	threshold := p.processedCount%p.rowThreshold == 0 && percent != p.lastLoggedPercent
	if milestone || threshold {
		level := telemetry.LogLevel("debug")
		if milestone {
			level = "progress"
		}
		p.emit(level, false)
		p.lastLoggedPercent = percent
	}
}

// Complete must only be called after the table's validations succeed.
func (p *ProgressTracker) Complete() {
	p.mu.Lock()
	defer p.mu.Unlock()
	if p.complete {
		return
	}
	p.complete = true
	p.emit("success", true)
}

func (p *ProgressTracker) emit(level telemetry.LogLevel, complete bool) {
	attributes := map[string]any{"table": p.tableName, "processed": p.processedCount, "total": p.totalCount, "complete": complete}
	message := fmt.Sprintf("Validating %s: %d rows processed", p.tableName, p.processedCount)
	if p.totalCount > 0 || complete {
		percent := 100.0
		total := p.totalCount
		if complete {
			total = p.processedCount
		} else {
			percent = min(99.9, float64(p.processedCount)*100/float64(total))
		}
		attributes["percent"] = percent
		message = fmt.Sprintf("Validating %s: %d/%d (%.1f%%)", p.tableName, p.processedCount, total, percent)
	}
	p.logger.Log(level, telemetry.LogEntry{Message: message, Attributes: attributes})
}

func (p *ProgressTracker) GetProcessedCount() int {
	p.mu.Lock()
	defer p.mu.Unlock()
	return p.processedCount
}
func (p *ProgressTracker) GetTotalCount() int { return p.totalCount }

func (l *Logger) CreateProgressTracker(source loggerTypes.TableCounter, table string, rowThreshold int) *ProgressTracker {
	total, err := source.GetTableCount(table)
	if err != nil {
		l.Debug(telemetry.LogEntry{Message: "Could not get table count for " + table, Error: err, Attributes: map[string]any{"table": table}})
		total = 0
	}
	return l.NewProgressTracker(table, total, rowThreshold)
}
