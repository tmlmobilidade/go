// Package logger renders validator diagnostics while reserving stdout for JSON.
package logger

import (
	"os"

	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/render"
)

/*
* RenderLogRecord routes every severity and development spacer to stderr so
* stdout can contain result JSON. ENVIRONMENT=dev selects readable output;
* other values select structured JSON with timestamps and severity attributes.
 */
func RenderLogRecord(record telemetry.LogRecord) {
	//

	//
	// 1. Select the environment renderer, sending both output streams to stderr.

	if os.Getenv("ENVIRONMENT") == "dev" {
		render.RenderDevTo(record, os.Stderr, os.Stderr)
	} else {
		render.RenderStructuredTo(record, os.Stderr, os.Stderr)
	}
}
