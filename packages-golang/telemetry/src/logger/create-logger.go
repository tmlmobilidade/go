package logger

import (
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/presentation"
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/types"
)

func CreateLogger(render LogRenderer) LoggerApi {
	log := func(level LogLevel, input LogInput) { render(ToRecord(level, input)) }
	return types.Logger{
		Critical:  func(input LogInput) { log("critical", input) },
		Debug:     func(input LogInput) { log("debug", input) },
		Divider:   presentation.Divider,
		Error:     func(input LogInput) { log("error", input) },
		Info:      func(input LogInput) { log("info", input) },
		Init:      presentation.Init,
		Log:       log,
		Progress:  func(input LogInput) { log("progress", input) },
		Spacer:    presentation.Spacer,
		Success:   func(input LogInput) { log("success", input) },
		Terminate: presentation.Terminate,
		Title:     presentation.Title,
		Warning:   func(input LogInput) { log("warning", input) },
	}
}
