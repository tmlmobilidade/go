package render

import (
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/levels"
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/presentation"
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/types"
	"os"
)

var STYLE = map[levels.LogLevel]struct {
	glyph  string
	stderr bool
}{
	"critical": {"‼", true}, "debug": {"·", false}, "error": {"✘", true},
	"info": {"→", false}, "progress": {"•", false}, "success": {"✓", false}, "warning": {"⚠", true},
}

// Errors may implement StackTrace() string to supply their original stack.
func errorStack(err error) string {
	if stack, ok := err.(interface{ StackTrace() string }); ok {
		return stack.StackTrace()
	}
	return ""
}

func RenderDev(record types.LogRecord) {
	style, ok := STYLE[record.Level]
	if !ok {
		panic("telemetry: unknown log level: " + string(record.Level))
	}
	output := os.Stdout
	if style.stderr {
		output = os.Stderr
	}
	presentation.Spacer(record.SpacesBefore)
	fmt.Fprintf(output, "%s %s\n", style.glyph, record.Message)
	if stack := errorStack(record.Error); stack != "" {
		fmt.Fprintln(output, stack)
	}
	presentation.Spacer(record.SpacesAfter)
}
