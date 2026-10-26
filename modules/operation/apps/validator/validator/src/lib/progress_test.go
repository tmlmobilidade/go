package lib

import (
	"bytes"
	"strings"
	"testing"

	"github.com/fatih/color"
)

func TestProgressOnlyCompletesAfterFileValidation(t *testing.T) {
	var output bytes.Buffer
	previous := color.Output
	color.Output = &output
	t.Cleanup(func() { color.Output = previous })
	tracker := NewProgressTracker("stop_times", 2001, 1000)
	for i := 0; i < 2001; i++ {
		tracker.Track()
	}
	if strings.Contains(output.String(), "100.0%") {
		t.Fatal("reported completion while grouped checks may still be running")
	}
	if tracker.GetProcessedCount() != 2001 {
		t.Fatal("lost processed rows")
	}
	tracker.Complete()
	tracker.Complete()
	if strings.Count(output.String(), "100.0%") != 1 {
		t.Fatalf("expected exactly one completion: %s", output.String())
	}
	if !strings.Contains(output.String(), "2001/2001 (100.0%)") {
		t.Fatal("incorrect final row count")
	}
}
