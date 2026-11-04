package telemetry_test

import (
	"encoding/json"
	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	"github.com/tmlmobilidade/go/packages-golang/telemetry/src/logger/render"
	"io"
	"os"
	"os/exec"
	"strings"
	"testing"
	"time"
)

type stackError struct{}

func (stackError) Error() string      { return "Out of range" }
func (stackError) StackTrace() string { return "stackError: Out of range\n  original call" }

// Temp files capture stdout and stderr without pipe-buffer deadlocks.
func capture(t *testing.T, run func()) (string, string) {
	t.Helper()
	stdout, err := os.CreateTemp(t.TempDir(), "stdout")
	if err != nil {
		t.Fatal(err)
	}
	defer stdout.Close()
	stderr, err := os.CreateTemp(t.TempDir(), "stderr")
	if err != nil {
		t.Fatal(err)
	}
	defer stderr.Close()
	oldStdout, oldStderr := os.Stdout, os.Stderr
	os.Stdout, os.Stderr = stdout, stderr
	defer func() { os.Stdout, os.Stderr = oldStdout, oldStderr }()
	run()
	if _, err := stdout.Seek(0, 0); err != nil {
		t.Fatal(err)
	}
	if _, err := stderr.Seek(0, 0); err != nil {
		t.Fatal(err)
	}
	out, err := io.ReadAll(stdout)
	if err != nil {
		t.Fatal(err)
	}
	errorOut, err := io.ReadAll(stderr)
	if err != nil {
		t.Fatal(err)
	}
	return string(out), string(errorOut)
}

func TestRenderers(t *testing.T) {
	dev := telemetry.CreateLogger(render.RenderDev)
	prd := telemetry.CreateLogger(render.RenderStructured)
	attributes := map[string]any{"agency_id": "CARRIS"}
	out, errorOut := capture(t, func() {
		dev.Info(telemetry.LogEntry{Message: "Ride processed", Attributes: attributes, SpacesBefore: 1, SpacesAfter: 1})
		dev.Warning("warning")
		dev.Error(stackError{})
	})
	if out != "\n→ Ride processed\n\n" || errorOut != "⚠ warning\n✘ Out of range\nstackError: Out of range\n  original call\n" {
		t.Fatalf("unexpected development output: %q / %q", out, errorOut)
	}
	out, errorOut = capture(t, func() {
		prd.Info(telemetry.LogEntry{Message: "Ride processed", Attributes: attributes, SpacesBefore: 2, SpacesAfter: 2})
		prd.Warning("warning")
		prd.Error(telemetry.LogEntry{Error: stackError{}, Attributes: map[string]any{"exception.message": "overridden"}})
	})
	lines := strings.Split(strings.TrimSpace(out), "\n")
	if len(lines) != 2 {
		t.Fatalf("unexpected production stdout: %q", out)
	}
	var record telemetry.OtelLogRecord
	if err := json.Unmarshal([]byte(lines[0]), &record); err != nil {
		t.Fatal(err)
	}
	if record.Body != "Ride processed" || record.Severity_number != 9 || record.Severity_text != "INFO" || record.Attributes["agency_id"] != "CARRIS" {
		t.Fatal(record)
	}
	if _, err := time.Parse("2006-01-02T15:04:05.000Z", record.Timestamp); err != nil {
		t.Fatal(err)
	}
	if err := json.Unmarshal([]byte(errorOut), &record); err != nil {
		t.Fatal(err)
	}
	if record.Severity_number != 17 || record.Attributes["exception.message"] != "Out of range" || record.Attributes["exception.type"] != "stackError" || record.Attributes["exception.stacktrace"] != (stackError{}).StackTrace() {
		t.Fatal(record)
	}
	if len(attributes) != 1 {
		t.Fatal("renderer mutated attributes")
	}
}

func TestPresentation(t *testing.T) {
	out, errorOut := capture(t, func() {
		telemetry.Logger.Divider("Section", 20)
		telemetry.Logger.Title("Title")
		telemetry.Logger.Terminate("Done")
		telemetry.Logger.Spacer()
	})
	if out != "\n- Section -----------\n\n\n▶︎ Title\n\n\n----\nDone\n----\n\n\n" || errorOut != "" {
		t.Fatalf("unexpected presentation: %q / %q", out, errorOut)
	}
}

func TestEnvironmentSelection(t *testing.T) {
	if os.Getenv("TELEMETRY_TEST_CHILD") == "1" {
		telemetry.Logger.Success("Done")
		return
	}
	for _, environment := range []string{"dev", "prd", ""} {
		command := exec.Command(os.Args[0], "-test.run=^TestEnvironmentSelection$")
		command.Env = append(os.Environ(), "TELEMETRY_TEST_CHILD=1", "ENVIRONMENT="+environment)
		output, err := command.Output()
		if err != nil {
			t.Fatal(err)
		}
		if environment == "dev" {
			if !strings.HasPrefix(string(output), "✓ Done\n") {
				t.Fatalf("unexpected dev output: %s", output)
			}
		} else {
			line := strings.SplitN(string(output), "\n", 2)[0]
			var record telemetry.OtelLogRecord
			if err := json.Unmarshal([]byte(line), &record); err != nil {
				t.Fatal(err)
			}
			if record.Body != "Done" || record.Severity_text != "INFO" {
				t.Fatal(record)
			}
		}
	}
}
