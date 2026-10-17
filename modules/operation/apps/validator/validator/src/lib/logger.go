package lib

import (
	"fmt"
	"strings"
	"time"

	"github.com/fatih/color"
)

// Level defines the severity of the log message
type Level int

const (
	Info Level = iota
	Error
	Debug 
)

var levelNames = []string{"info", "error", "debug"}

func ParseLevel(level string) Level {
	for i, name := range levelNames {
		if name == level {
			return Level(i)
		}
	}

	return Debug
}

// Predefined terminal colors
var (
	colorDebug  = color.New(color.FgYellow)
	colorInfo   = color.New(color.FgCyan)
	colorError  = color.New(color.FgRed)
	colorAccent = color.New(color.FgHiGreen)
)

// Logger represents a customizable logger
type Logger struct {
	WithTimestamp bool
	Level         Level
}

// NewLogger creates a new Logger instance
func NewLogger(withTimestamp bool, level ...Level) *Logger {
	if len(level) == 0 {
		level = []Level{Debug}
	}

	return &Logger{
		WithTimestamp: withTimestamp,
		Level:         level[0],
	}
}

// log prints a message with the specified color and level
func (l *Logger) log(c *color.Color, lvl Level, message string) {
	if lvl > l.Level {
		return
	}

	prefix := fmt.Sprintf("[%s]", levelNames[lvl])

	if l.WithTimestamp {
		timestamp := time.Now().Format("2006-01-02 15:04:05")
		message = fmt.Sprintf("[%s] %s %s", timestamp, prefix, message)
	} else {
		message = fmt.Sprintf("%s %s", prefix, message)
	}

	c.Println(message)
}

// Divider prints a nice divider, with optional centered text
func (l *Logger) Divider(message ...string) {
	const width = 50
	line := strings.Repeat("-", width)

	if len(message) == 0 {
		fmt.Printf("\n%s\n", line)
		return
	}

	msg := strings.TrimSpace(message[0])
	padding := (width - len(msg) - 2) / 2
	if padding < 0 {
		padding = 0
	}

	fmt.Printf("\n%s %s %s\n\n", strings.Repeat("-", padding), msg, strings.Repeat("-", padding))
}

// Debug logs a debug-level message
func (l *Logger) Debug(message ...string) {
	if l.Level < Debug {
		return
	}

	msg := strings.Join(message, " ")
	l.log(colorDebug, Debug, msg)
}

// Info logs an info-level message
func (l *Logger) Info(message ...string) {
	if l.Level < Info {
		return
	}

	msg := strings.Join(message, " ")
	l.log(colorInfo, Info, msg)
}

// Error logs an error-level message
func (l *Logger) Error(message ...string) {
	if l.Level < Error {
		return
	}

	msg := strings.Join(message, " ")
	l.log(colorError, Error, msg)
}

func (l *Logger) Accent(message ...string) {
	msg := strings.Join(message, " ")
	l.log(colorAccent, Debug, msg)
}

// Custom logs a message with a custom terminal color
func (l *Logger) Custom(message string, c *color.Color, lvl Level) {
	l.log(c, lvl, message)
}

func (l *Logger) Clear() {
	fmt.Print("\033c")
}

func (l *Logger) SetLogLevel(level string) {
	l.Level = ParseLevel(level)
}

var AppLogger = NewLogger(true, Debug)

// PerformanceTracker represents a timer for tracking operation performance
type PerformanceTracker struct {
	start     time.Time
	operation string
	logger    *Logger
}

// StartPerformanceTracker creates a new performance tracker
func (l *Logger) StartPerformanceTracker(operation string) *PerformanceTracker {
	l.Info(fmt.Sprintf("[%s] Starting operation", operation))
	return &PerformanceTracker{
		start:     time.Now(),
		operation: operation,
		logger:    l,
	}
}

// End stops the performance tracker and logs the duration
func (pt *PerformanceTracker) End() {
	duration := time.Since(pt.start)
	pt.logger.Info(fmt.Sprintf("[%s] Operation completed in %v", pt.operation, duration))
}

// ProgressBar prints a progress bar
func (l *Logger) ProgressBar(progress int, total int) {
	bar := fmt.Sprintf("[%d/%d]", progress, total)
	l.log(colorAccent, Debug, bar)
}
