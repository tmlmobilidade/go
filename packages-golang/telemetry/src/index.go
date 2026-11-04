// Package telemetry exports the shared logger and timer.
// Exported TypeScript names retain their spelling with Go's required initial capitals.
package telemetry

import (
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger"
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/timer"
)

var Logger = logger.Logger
var SEVERITY = logger.SEVERITY

type LogLevel = logger.LogLevel
type LogEntry = logger.LogEntry
type LogInput = logger.LogInput
type LogRecord = logger.LogRecord
type LoggerApi = logger.LoggerApi
type LogRenderer = logger.LogRenderer
type OtelLogRecord = logger.OtelLogRecord
type Timer = timer.Timer

func NewTimer() *Timer                          { return timer.NewTimer() }
func CreateLogger(render LogRenderer) LoggerApi { return logger.CreateLogger(render) }
