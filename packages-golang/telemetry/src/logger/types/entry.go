package types

import "github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/levels"

// LogEntry is the object form accepted by every level method.
// An empty Message defaults to Error.Error(), when an error is attached.
// Set MessageOverride to preserve an explicitly empty message with an error.
type LogEntry struct {
	Attributes      map[string]any
	Error           error
	Message         string
	MessageOverride *string
	SpacesAfter     int
	SpacesBefore    int
}

// LogInput accepts a string, error, or LogEntry (value or pointer).
type LogInput = any

type LogRecord struct {
	LogEntry
	Level levels.LogLevel
}
