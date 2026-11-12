package types

import "github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/levels"

type LogRenderer func(record LogRecord)

// Logger exposes the same API for development and production.
type Logger struct {
	Critical                func(LogInput)
	Debug                   func(LogInput)
	Divider                 func(message string, size ...int)
	Error                   func(LogInput)
	Info                    func(LogInput)
	Init                    func()
	Log                     func(levels.LogLevel, LogInput)
	Progress                func(LogInput)
	ProgressBar             func(progress, total int)
	SetLogLevel             func(string) error
	StartPerformanceTracker func(operation string) *PerformanceTracker
	Spacer                  func(lines ...int)
	Success                 func(LogInput)
	Terminate               func(string)
	Title                   func(string)
	Warning                 func(LogInput)
}

// PerformanceTracker completes an operation once. Pass an error to report failure.
type PerformanceTracker struct {
	End func(...error)
}
