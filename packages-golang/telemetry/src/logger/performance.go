package logger

import (
	"fmt"
	"sync"

	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/types"
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/timer"
)

func startPerformanceTracker(log func(LogLevel, LogInput), operation string) *types.PerformanceTracker {
	timing := timer.NewTimer()
	log("progress", types.LogEntry{Message: fmt.Sprintf("[%s] Starting operation", operation),
		Attributes: map[string]any{"operation": operation, "status": "started"}})
	var once sync.Once
	return &types.PerformanceTracker{End: func(errors ...error) {
		once.Do(func() {
			entry := types.LogEntry{Message: fmt.Sprintf("[%s] Operation completed in %s", operation, timing.Get()),
				Attributes: map[string]any{"operation": operation, "status": "completed", "duration_ms": timing.GetMs()}}
			for _, err := range errors {
				if err != nil {
					entry.Error = err
					entry.Message = fmt.Sprintf("[%s] Operation failed after %s: %v", operation, timing.Get(), err)
					entry.Attributes["status"] = "failed"
					log("error", entry)
					return
				}
			}
			log("success", entry)
		})
	}}
}
