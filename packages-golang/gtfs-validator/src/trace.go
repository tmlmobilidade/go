package gtfsvalidator

import (
	"slices"
	"strings"
	"sync"
	"time"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

type traceRecorder struct {
	data           types.ValidationTrace
	startedAt      time.Time
	phase          string
	validated      bool
	mu             sync.Mutex // Serialize events from the scheduler, workers and context.
	cancelRecorded bool
}

func (t *traceRecorder) begin(options Options) {
	t.data = types.ValidationTrace{
		Version:     1,
		StartedAt:   t.startedAt.UTC(),
		Concurrency: max(options.Concurrency, 1),
		Rules:       make([]types.TraceRule, 0, len(options.Rules)),
		Events:      []types.TraceEvent{{Kind: "run_started"}, {Kind: "phase_started", Phase: "graph"}},
	}
	for _, rule := range options.Rules {
		deps := make([]string, len(rule.DependsOn))
		for i, id := range rule.DependsOn {
			deps[i] = strings.ToLower(id)
		}
		t.data.Rules = append(t.data.Rules, types.TraceRule{
			RuleID:    strings.ToLower(rule.RuleID),
			Severity:  types.Severities(strings.ToLower(string(rule.Severity))),
			DependsOn: deps,
		})
	}
	slices.SortFunc(t.data.Rules, func(a, b types.TraceRule) int { return strings.Compare(a.RuleID, b.RuleID) })
	t.phase = "graph"
	t.endPhase(nil)
}

func (t *traceRecorder) record(event types.TraceEvent) {
	t.mu.Lock()
	defer t.mu.Unlock()
	if event.Kind == string(types.TaskCancelled) {
		if t.cancelRecorded {
			return
		}
		t.cancelRecorded = true
	}
	event.ElapsedNS = time.Since(t.startedAt).Nanoseconds()
	t.data.Events = append(t.data.Events, event)
}

func (t *traceRecorder) startPhase(name string) {
	if t == nil {
		return
	}
	t.phase = name
	t.validated = t.validated || name == "validation"
	t.record(types.TraceEvent{Kind: "phase_started", Phase: name})
}

func (t *traceRecorder) endPhase(err error) {
	if t == nil || t.phase == "" {
		return
	}
	event := types.TraceEvent{Kind: "phase_finished", Phase: t.phase, Status: "completed"}
	if err != nil {
		event.Status = "errored"
		event.Error = err.Error()
	}
	t.record(event)
	t.phase = ""
}

func (t *traceRecorder) cancel(cause error) {
	t.record(types.TraceEvent{Kind: string(types.TaskCancelled), Error: cause.Error()})
}

func (t *traceRecorder) observe(event types.TaskEvent[[]types.Finding]) {
	if event.Kind == types.TaskCancelled {
		t.cancel(event.Cause)
		return
	}
	t.record(types.TraceEvent{
		Kind:         string(event.Kind),
		RuleID:       event.Result.ID,
		Status:       string(event.Result.Status),
		BlockedBy:    event.Result.BlockedBy,
		Reason:       event.Result.Reason,
		Error:        event.Result.Error,
		FindingCount: len(event.Result.Value),
	})
}

func (t *traceRecorder) finish(err error) {
	if !t.validated {
		for _, rule := range t.data.Rules {
			t.record(types.TraceEvent{
				Kind:   string(types.TaskSkipped),
				RuleID: rule.RuleID,
				Status: string(types.Skipped),
				Reason: "run ended before validation",
			})
		}
	}
	event := types.TraceEvent{Kind: "run_finished", Status: "completed"}
	if err != nil {
		event.Status = "aborted"
		event.Error = err.Error()
	}
	t.record(event)
}
