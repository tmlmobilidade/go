// Package logger adds validation progress to the shared telemetry logger.
package logger

import (
	"os"

	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/render"
)

type Logger struct{ telemetry.LoggerApi }

// NewLogger retains all telemetry level methods and supports custom renderers.
func NewLogger(renderer telemetry.LogRenderer) *Logger {
	return &Logger{LoggerApi: telemetry.CreateLogger(renderer)}
}

// RenderLogRecord routes severity logs to stderr so stdout can contain result JSON.
func RenderLogRecord(record telemetry.LogRecord) {
	if os.Getenv("ENVIRONMENT") == "dev" {
		render.RenderDevTo(record, os.Stderr, os.Stderr)
	} else {
		render.RenderStructuredTo(record, os.Stderr, os.Stderr)
	}
}
