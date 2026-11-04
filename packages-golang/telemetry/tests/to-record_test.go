package telemetry_test

import (
	"errors"
	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger"
	"reflect"
	"testing"
)

func TestToRecord(t *testing.T) {
	err := errors.New("boom")
	empty := ""
	for _, test := range []struct {
		input   telemetry.LogInput
		message string
		err     error
	}{
		{"hello", "hello", nil}, {err, "boom", err},
		{telemetry.LogEntry{Error: err, Attributes: map[string]any{"a": 1}}, "boom", err},
		{telemetry.LogEntry{Error: err, Message: "context"}, "context", err},
		{telemetry.LogEntry{Error: err, MessageOverride: &empty}, "", err},
		{&telemetry.LogEntry{Message: "pointer"}, "pointer", nil},
	} {
		record := logger.ToRecord("error", test.input)
		if record.Message != test.message || record.Error != test.err || record.Level != "error" {
			t.Fatalf("unexpected record: %+v", record)
		}
	}
}

func TestSeverityAndLevelMethods(t *testing.T) {
	var records []telemetry.LogRecord
	logger := telemetry.CreateLogger(func(record telemetry.LogRecord) { records = append(records, record) })
	methods := []func(telemetry.LogInput){logger.Debug, logger.Info, logger.Success, logger.Progress, logger.Warning, logger.Error, logger.Critical}
	levels := []telemetry.LogLevel{"debug", "info", "success", "progress", "warning", "error", "critical"}
	numbers := []int{5, 9, 9, 9, 13, 17, 21}
	for i, method := range methods {
		method("message")
		if records[i].Level != levels[i] || telemetry.SEVERITY[levels[i]].Number != numbers[i] {
			t.Fatalf("incorrect level or severity: %+v", records[i])
		}
	}
	logger.Log("info", telemetry.LogEntry{Message: "event", Attributes: map[string]any{"id": 42}})
	if !reflect.DeepEqual(records[7].Attributes, map[string]any{"id": 42}) {
		t.Fatal(records[7])
	}
	if telemetry.SEVERITY["critical"].Text != "FATAL" {
		t.Fatal("incorrect critical severity")
	}
}
