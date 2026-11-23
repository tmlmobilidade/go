package render

import (
	"encoding/json"
	"io"
	"os"
	"reflect"
	"time"

	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/levels"
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/types"
)

type OtelLogRecord struct {
	Attributes      map[string]any `json:"attributes,omitempty"`
	Body            string         `json:"body"`
	Severity_number int            `json:"severity_number"`
	Severity_text   string         `json:"severity_text"`
	Timestamp       string         `json:"timestamp"`
}

func exceptionAttributes(err error) map[string]any {
	if err == nil {
		return nil
	}
	errorType := reflect.TypeOf(err)
	for errorType.Kind() == reflect.Pointer {
		errorType = errorType.Elem()
	}
	attributes := map[string]any{"exception.message": err.Error(), "exception.type": errorType.Name()}
	if stack := errorStack(err); stack != "" {
		attributes["exception.stacktrace"] = stack
	}
	return attributes
}

func RenderStructured(record types.LogRecord) {
	RenderStructuredTo(record, os.Stdout, os.Stderr)
}

// RenderStructuredTo renders to the supplied output streams.
func RenderStructuredTo(record types.LogRecord, stdout, stderr io.Writer) {
	severity, ok := levels.SEVERITY[record.Level]
	if !ok {
		panic("telemetry: unknown log level: " + string(record.Level))
	}
	attributes := make(map[string]any, len(record.Attributes)+3)
	for key, value := range record.Attributes {
		attributes[key] = value
	}
	for key, value := range exceptionAttributes(record.Error) {
		attributes[key] = value
	}
	line := OtelLogRecord{Attributes: attributes, Body: record.Message, Severity_number: severity.Number,
		Severity_text: severity.Text, Timestamp: time.Now().UTC().Format("2006-01-02T15:04:05.000Z")}
	output := stdout
	if severity.Number >= levels.SEVERITY["error"].Number {
		output = stderr
	}
	if err := json.NewEncoder(output).Encode(line); err != nil {
		panic(err)
	}
}
