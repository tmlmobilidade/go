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

// AppLogger reserves stdout for the validator's JSON result, in both environments.
var AppLogger = NewLogger(func(record telemetry.LogRecord) {
	if os.Getenv("ENVIRONMENT") == "dev" {
		render.RenderDevTo(record, os.Stderr, os.Stderr)
	} else {
		render.RenderStructuredTo(record, os.Stderr, os.Stderr)
	}
})
