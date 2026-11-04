// Package levels holds shared severity definitions without introducing import cycles.
package levels

type LogLevel string

type Severity struct {
	Number int
	Text   string
}

var SEVERITY = map[LogLevel]Severity{
	"critical": {Number: 21, Text: "FATAL"},
	"debug":    {Number: 5, Text: "DEBUG"},
	"error":    {Number: 17, Text: "ERROR"},
	"info":     {Number: 9, Text: "INFO"},
	"progress": {Number: 9, Text: "INFO"},
	"success":  {Number: 9, Text: "INFO"},
	"warning":  {Number: 13, Text: "WARN"},
}
