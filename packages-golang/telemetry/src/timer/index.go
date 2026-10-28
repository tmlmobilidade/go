// Package timer tracks elapsed time in milliseconds.
package timer

import (
	"fmt"
	"strings"
	"time"
)

type Timer struct{ startTime time.Time }

func NewTimer() *Timer { return &Timer{startTime: time.Now()} }

func (t *Timer) Get(reset ...bool) string { return t.formatElapsedTime(t.GetMs(reset...)) }

func (t *Timer) GetMs(reset ...bool) int64 {
	elapsedTime := time.Since(t.startTime).Milliseconds()
	if len(reset) > 0 && reset[0] {
		t.Reset()
	}
	return elapsedTime
}

func (t *Timer) GetSeconds(reset ...bool) float64 { return float64(t.GetMs(reset...)) / 1000 }

func (t *Timer) Reset() { t.startTime = time.Now() }

func (t *Timer) formatElapsedTime(elapsedTime int64) string {
	duration := max(int64(0), elapsedTime)
	hours := duration / (1000 * 60 * 60)
	minutes := duration / (1000 * 60) % 60
	seconds := duration / 1000 % 60
	milliseconds := duration % 1000
	parts := []string{}
	if hours > 0 {
		parts = append(parts, fmt.Sprintf("%dh", hours))
	}
	if minutes > 0 {
		parts = append(parts, fmt.Sprintf("%dm", minutes))
	}
	if seconds > 0 {
		parts = append(parts, fmt.Sprintf("%ds", seconds))
	}
	if milliseconds > 0 || len(parts) == 0 {
		parts = append(parts, fmt.Sprintf("%dms", milliseconds))
	}
	return strings.Join(parts, " ")
}
