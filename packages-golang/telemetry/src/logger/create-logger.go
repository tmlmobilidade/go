package logger

import (
	"fmt"
	"sync/atomic"

	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/levels"
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/presentation"
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/types"
)

func CreateLogger(render LogRenderer) LoggerApi {
	var minimum atomic.Int32
	minimum.Store(int32(levels.SEVERITY["debug"].Number))
	log := func(level LogLevel, input LogInput) {
		severity, exists := levels.SEVERITY[level]
		if !exists {
			panic("telemetry: unknown log level: " + string(level))
		}
		if int32(severity.Number) >= minimum.Load() {
			render(ToRecord(level, input))
		}
	}
	return types.Logger{
		Critical: func(input LogInput) { log("critical", input) },
		Debug:    func(input LogInput) { log("debug", input) },
		Divider:  presentation.Divider,
		Error:    func(input LogInput) { log("error", input) },
		Info:     func(input LogInput) { log("info", input) },
		Init:     presentation.Init,
		Log:      log,
		Progress: func(input LogInput) { log("progress", input) },
		ProgressBar: func(progress, total int) {
			log("progress", types.LogEntry{Message: fmt.Sprintf("[%d/%d]", progress, total),
				Attributes: map[string]any{"processed": progress, "total": total}})
		},
		SetLogLevel: func(level string) error {
			severity, exists := levels.SEVERITY[LogLevel(level)]
			if !exists {
				return fmt.Errorf("telemetry: unknown log level %q", level)
			}
			minimum.Store(int32(severity.Number))
			return nil
		},
		StartPerformanceTracker: func(operation string) *types.PerformanceTracker {
			return startPerformanceTracker(log, operation)
		},
		Spacer:    presentation.Spacer,
		Success:   func(input LogInput) { log("success", input) },
		Terminate: presentation.Terminate,
		Title:     presentation.Title,
		Warning:   func(input LogInput) { log("warning", input) },
	}
}
