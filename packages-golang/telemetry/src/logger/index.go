// Package logger provides human-readable development logs and OpenTelemetry JSON logs.
package logger

import (
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/render"
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/types"
	"os"
)

var IS_DEV = os.Getenv("ENVIRONMENT") == "dev"

// Logger selects its renderer once when the package is initialized.
var Logger = func() LoggerApi {
	if IS_DEV {
		return CreateLogger(render.RenderDev)
	}
	return CreateLogger(render.RenderStructured)
}()

type LogEntry = types.LogEntry
type LogInput = types.LogInput
type LogRecord = types.LogRecord
type LoggerApi = types.Logger
type LogRenderer = types.LogRenderer
type OtelLogRecord = render.OtelLogRecord
