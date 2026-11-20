package gtfsvalidator

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
)

type validationProgress struct {
	total     int
	phase     string
	startedAt time.Time
	mu        sync.Mutex // Serialize progress from the scheduler and its workers.
	started   map[string]time.Time
	completed int
	outcomes  map[types.Status]int
}

func (p *validationProgress) startPhase(phase, message string) {
	p.phase = phase
	telemetry.Logger.Progress(telemetry.LogEntry{Message: message, Attributes: map[string]any{"phase": phase}})
}

func (p *validationProgress) observe(event types.TaskEvent[[]types.Finding]) {
	if event.Kind == types.TaskReady {
		return
	}
	now := time.Now()
	p.mu.Lock()
	defer p.mu.Unlock()

	if event.Kind == types.TaskCancelled {
		telemetry.Logger.Warning(telemetry.LogEntry{
			Message: "Stopping rule execution: " + event.Cause.Error(), Error: event.Cause,
		})
		return
	}

	result := event.Result
	attrs := map[string]any{"rule_id": result.ID, "rules_total": p.total}
	if event.Kind == types.TaskStarted {
		p.started[result.ID] = now
		attrs["status"] = "running"
		attrs["rules_completed"] = p.completed
		attrs["rules_running"] = len(p.started)
		telemetry.Logger.Progress(telemetry.LogEntry{
			Message:    fmt.Sprintf("[%d/%d] %s started (%d running)", p.completed, p.total, result.ID, len(p.started)),
			Attributes: attrs,
		})
		return
	}

	p.completed++
	p.outcomes[result.Status]++
	attrs["rules_completed"] = p.completed
	attrs["status"] = result.Status
	attrs["finding_count"] = len(result.Value)
	var detail string
	if result.Status == types.Skipped {
		detail = result.Reason
		attrs["reason"] = result.Reason
		if len(result.BlockedBy) > 0 {
			attrs["blocked_by"] = result.BlockedBy
			detail += "; blocked by " + strings.Join(result.BlockedBy, ", ")
		}
	} else {
		duration := now.Sub(p.started[result.ID])
		delete(p.started, result.ID)
		attrs["elapsed_us"] = duration.Microseconds()
		detail = fmt.Sprintf("%s, findings %d", duration.Round(time.Microsecond), len(result.Value))
		if result.Error != "" {
			detail += ": " + result.Error
			attrs["error"] = result.Error
		}
	}

	log := telemetry.Logger.Progress
	switch result.Status {
	case types.Passed:
		log = telemetry.Logger.Success
	case types.Failed:
		log = telemetry.Logger.Warning
	case types.Errored:
		log = telemetry.Logger.Error
	}
	log(telemetry.LogEntry{
		Message:    fmt.Sprintf("[%d/%d] %s %s (%s)", p.completed, p.total, result.ID, result.Status, detail),
		Attributes: attrs,
	})
}

func (p *validationProgress) finish(summary types.Summary, err error) {
	duration := time.Since(p.startedAt)
	counts := fmt.Sprintf("%d/%d rules resolved, %d passed, %d failed, %d skipped, %d errored",
		p.completed, p.total, p.outcomes[types.Passed], p.outcomes[types.Failed], p.outcomes[types.Skipped], p.outcomes[types.Errored])
	entry := telemetry.LogEntry{Attributes: map[string]any{
		"elapsed_us": duration.Microseconds(), "rules_total": p.total, "rules_completed": p.completed,
		"rules_passed": p.outcomes[types.Passed], "rules_failed": p.outcomes[types.Failed],
		"rules_skipped": p.outcomes[types.Skipped], "rules_errored": p.outcomes[types.Errored],
	}}
	if err != nil {
		entry.Message = fmt.Sprintf("Validation aborted during %s after %s (%s): %v", p.phase, duration.Round(time.Microsecond), counts, err)
		entry.Error = err
		entry.Attributes["phase"] = p.phase
		telemetry.Logger.Error(entry)
		return
	}
	entry.Message = fmt.Sprintf("Validation completed in %s (%s). Report totals: errors %d, warnings %d",
		duration.Round(time.Microsecond), counts, summary.TotalErrors, summary.TotalWarnings)
	entry.Attributes["total_errors"] = summary.TotalErrors
	entry.Attributes["total_warnings"] = summary.TotalWarnings
	if summary.TotalErrors > 0 || summary.TotalWarnings > 0 {
		telemetry.Logger.Warning(entry)
	} else {
		telemetry.Logger.Success(entry)
	}
}
