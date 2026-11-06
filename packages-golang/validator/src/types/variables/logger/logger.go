package logger

import loggerService "github.com/tmlmobilidade/go/packages-golang/validator/src/services/logger"

// AppLogger reserves stdout for validation JSON in every environment.
var AppLogger = loggerService.NewLogger(loggerService.RenderLogRecord)
