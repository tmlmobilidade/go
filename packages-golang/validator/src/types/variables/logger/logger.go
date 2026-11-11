package logger

import (
	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	loggerService "github.com/tmlmobilidade/go/packages-golang/validator/src/services/logger"
)

// AppLogger reserves stdout for validation JSON in every environment.
var AppLogger = telemetry.CreateLogger(loggerService.RenderLogRecord)
