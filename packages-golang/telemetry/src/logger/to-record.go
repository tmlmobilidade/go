package logger

import "fmt"

// ToRecord normalizes strings, errors and entries into a resolved record.
func ToRecord(level LogLevel, input LogInput) LogRecord {
	var entry LogEntry
	switch input := input.(type) {
	case string:
		entry.Message = input
	case error:
		entry.Error = input
	case LogEntry:
		entry = input
	case *LogEntry:
		if input == nil {
			panic("telemetry: nil LogEntry")
		}
		entry = *input
	default:
		panic(fmt.Sprintf("telemetry: unsupported LogInput %T", input))
	}
	if entry.MessageOverride != nil {
		entry.Message = *entry.MessageOverride
	} else if entry.Message == "" && entry.Error != nil {
		entry.Message = entry.Error.Error()
	}
	return LogRecord{LogEntry: entry, Level: level}
}
