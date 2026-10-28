package render

import (
	"fmt"
	"io"
	"os"

	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/levels"
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/types"
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
	RenderDevTo(record, os.Stdout, os.Stderr)
}

// RenderDevTo renders to the supplied output streams.
func RenderDevTo(record types.LogRecord, stdout, stderr io.Writer) {
	style, ok := STYLE[record.Level]
	if !ok {
		panic("telemetry: unknown log level: " + string(record.Level))
	}
	output := stdout
	if style.stderr {
		output = stderr
	}
	for i := 0; i < record.SpacesBefore; i++ {
		fmt.Fprintln(stdout)
	}
	fmt.Fprintf(output, "%s %s\n", style.glyph, record.Message)
	if stack := errorStack(record.Error); stack != "" {
		fmt.Fprintln(output, stack)
	}
	for i := 0; i < record.SpacesAfter; i++ {
		fmt.Fprintln(stdout)
	}
}
