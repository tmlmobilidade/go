package types

import "time"

// ValidationTrace is the versioned input for visualization.html. Events are in
// observed order and their offsets use a monotonic clock relative to StartedAt.
type ValidationTrace struct {
	Version     int          `json:"version"`
	StartedAt   time.Time    `json:"started_at"`
	Concurrency int          `json:"concurrency"`
	Rules       []TraceRule  `json:"rules"`
	Events      []TraceEvent `json:"events"`
}

// TraceRule contains the graph metadata needed for playback.
type TraceRule struct {
	RuleID    string     `json:"rule_id"`
	Severity  Severities `json:"severity"`
	DependsOn []string   `json:"depends_on,omitempty"`
}

type TraceEvent struct {
	ElapsedNS    int64    `json:"elapsed_ns"`
	Kind         string   `json:"kind"`
	Phase        string   `json:"phase,omitempty"`
	RuleID       string   `json:"rule_id,omitempty"`
	Status       string   `json:"status,omitempty"`
	BlockedBy    []string `json:"blocked_by,omitempty"`
	Reason       string   `json:"reason,omitempty"`
	Error        string   `json:"error,omitempty"`
	FindingCount int      `json:"finding_count,omitempty"`
}
