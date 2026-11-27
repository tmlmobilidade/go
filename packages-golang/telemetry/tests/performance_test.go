package telemetry_test

import (
	"errors"
	"sync"
	"testing"

	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
)

func TestLogLevelFiltering(t *testing.T) {
	var records []telemetry.LogRecord
	logger := telemetry.CreateLogger(func(record telemetry.LogRecord) { records = append(records, record) })
	if err := logger.SetLogLevel("warning"); err != nil {
		t.Fatal(err)
	}
	logger.Debug("hidden")
	logger.Info("hidden")
	logger.Success("hidden")
	logger.Progress("hidden")
	logger.Warning("warning")
	logger.Error("error")
	logger.Critical("critical")
	if len(records) != 3 {
		t.Fatalf("unexpected records: %+v", records)
	}
	if err := logger.SetLogLevel("invalid"); err == nil {
		t.Fatal("unknown level accepted")
	}
	logger.Info("still hidden")
	if len(records) != 3 {
		t.Fatal("invalid level changed the filter")
	}
	if err := logger.SetLogLevel("info"); err != nil {
		t.Fatal(err)
	}
	logger.Error("always visible")
	logger.Info("visible")
	logger.Debug("hidden")
	if len(records) != 5 {
		t.Fatalf("unexpected records: %+v", records)
	}
}

func TestPerformanceTrackerCompletion(t *testing.T) {
	for _, failed := range []bool{false, true} {
		t.Run(map[bool]string{false: "success", true: "failure"}[failed], func(t *testing.T) {
			var records []telemetry.LogRecord
			logger := telemetry.CreateLogger(func(record telemetry.LogRecord) { records = append(records, record) })
			tracker := logger.StartPerformanceTracker("Preparing SQLite")
			var err error
			if failed {
				err = errors.New("database closed")
			}
			var workers sync.WaitGroup
			for range 8 {
				workers.Go(func() { tracker.End(err) })
			}
			workers.Wait()
			if len(records) != 2 {
				t.Fatalf("want start and one completion: %+v", records)
			}
			end := records[1]
			status, level := "completed", telemetry.LogLevel("success")
			if failed {
				status, level = "failed", "error"
			}
			if end.Level != level || end.Error != err || end.Attributes["status"] != status || end.Attributes["operation"] != "Preparing SQLite" {
				t.Fatalf("unexpected completion: %+v", end)
			}
			if duration, ok := end.Attributes["duration_ms"].(int64); !ok || duration < 0 {
				t.Fatalf("invalid duration: %+v", end)
			}
		})
	}
}
