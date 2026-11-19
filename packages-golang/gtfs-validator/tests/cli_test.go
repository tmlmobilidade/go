package gtfsvalidator_test

import (
	"bytes"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

// Exercise the standalone entry point, including its output streams and exit codes.
func TestCLI(t *testing.T) {
	directory := t.TempDir()
	binary := filepath.Join(directory, "gtfs-validator")
	// Match the package build script. Disabling DWARF avoids a macOS SQLite link issue.
	build := exec.Command("go", "build", "-ldflags=-w", "-o", binary, "../src/cli.go")
	if output, err := build.CombinedOutput(); err != nil {
		t.Fatalf("build: %s: %v", output, err)
	}

	write := func(name string, data []byte) string {
		t.Helper()
		path := filepath.Join(directory, name)
		if err := os.WriteFile(path, data, 0600); err != nil {
			t.Fatal(err)
		}
		return path
	}
	feed := write("feed.zip", archive(t, map[string]string{"agency.txt": "agency_name\nExample\n"}))
	emptyFeed := write("empty-feed.zip", archive(t, nil))
	data, err := json.Marshal(agencyRules())
	if err != nil {
		t.Fatal(err)
	}
	rulesPath := write("rules.json", data)

	for _, test := range []struct {
		name   string
		args   []string
		exit   int
		report bool
	}{
		{"valid", []string{"-path", feed, "-rules", rulesPath, "-concurrency", "2"}, 0, true},
		{"missing agency", []string{"-path", emptyFeed, "-rules", rulesPath}, 1, true},
		{"import error", []string{"-path", filepath.Join(directory, "missing.zip"), "-rules", rulesPath}, 2, true},
		{"no source", nil, 2, false},
		{"both sources", []string{"-path", feed, "-url", "https://example.invalid/feed.zip", "-rules", rulesPath}, 2, false},
		{"missing rules flag", []string{"-path", feed}, 2, false},
		{"missing rules file", []string{"-path", feed, "-rules", filepath.Join(directory, "missing.json")}, 2, false},
		{"null rules", []string{"-path", feed, "-rules", write("null.json", []byte("null"))}, 2, false},
		{"empty rules", []string{"-path", feed, "-rules", write("empty.json", []byte("[]"))}, 2, false},
		{"object rules", []string{"-path", feed, "-rules", write("object.json", []byte("{}"))}, 2, false},
		{"invalid JSON", []string{"-path", feed, "-rules", write("invalid.json", []byte("["))}, 2, false},
		{"trailing JSON", []string{"-path", feed, "-rules", write("trailing.json", append(data, []byte(" []")...))}, 2, false},
		{"notice ID", []string{"-path", feed, "-rules", write("notice.json", []byte(`[{"rule_id":"file_validation","severity":"error"}]`))}, 2, false},
		{"concurrency", []string{"-path", feed, "-rules", rulesPath, "-concurrency", "0"}, 2, false},
		{"positional", []string{"-path", feed, "-rules", rulesPath, "extra"}, 2, false},
		{"help", []string{"-help"}, 0, false},
	} {
		t.Run(test.name, func(t *testing.T) {
			command := exec.Command(binary, test.args...)
			var stdout, stderr bytes.Buffer
			command.Stdout = &stdout
			command.Stderr = &stderr
			err := command.Run()
			code := 0
			if err != nil {
				if exit, ok := err.(*exec.ExitError); ok {
					code = exit.ExitCode()
				} else {
					t.Fatal(err)
				}
			}

			if code != test.exit {
				t.Fatalf("exit %d, want %d: %s", code, test.exit, stderr.String())
			}
			if code == 2 && stderr.Len() == 0 {
				t.Fatal("missing error message")
			}

			if test.report {
				var report types.Summary
				if err := json.Unmarshal(stdout.Bytes(), &report); err != nil {
					t.Fatalf("stdout is not a JSON report: %s", stdout.String())
				}
				if code == 1 {
					if report.TotalErrors != 1 || report.TotalWarnings != 0 ||
						len(report.Messages) != 1 || report.Messages[0].RuleID != "agency_file_exists" {
						t.Fatal("expected a missing agency finding", stdout.String())
					}
				} else if report.Messages == nil || len(report.Messages) != 0 || report.TotalErrors != 0 || report.TotalWarnings != 0 {
					t.Fatal("unexpected report", stdout.String())
				}
			} else if stdout.Len() != 0 {
				t.Fatal("unexpected stdout", stdout.String())
			}
		})
	}
	t.Run("execution trace", func(t *testing.T) {
		config := write("trace-rules.json", []byte(`[
			{"rule_id":"AGENCY_FILE_EXISTS","severity":"ERROR"},
			{"rule_id":"agency_name_exists","severity":"warning","depends_on":["AGENCY_FILE_EXISTS"]},
			{"rule_id":"agency_url_valid","severity":"ignore"}
		]`))
		for _, test := range []struct {
			name, input, runState string
			exit                  int
			first, child          types.Status
		}{
			{"passed", feed, "completed", 0, types.Passed, types.Passed},
			{"blocked", emptyFeed, "completed", 1, types.Failed, types.Skipped},
			{"aborted", filepath.Join(directory, "missing.zip"), "aborted", 2, types.Skipped, types.Skipped},
		} {
			t.Run(test.name, func(t *testing.T) {
				path := filepath.Join(directory, test.name+"-trace.json")
				args := []string{"-path", test.input, "-rules", config, "-concurrency", "2"}
				plain, _ := exec.Command(binary, args...).Output()
				stdout, err := exec.Command(binary, append(args, "-trace", path)...).Output()
				code := 0
				if err != nil {
					if exit, ok := err.(*exec.ExitError); ok {
						code = exit.ExitCode()
					} else {
						t.Fatal(err)
					}
				}
				if code != test.exit || len(stdout) == 0 || !bytes.Equal(stdout, plain) {
					t.Fatalf("trace changed report or exit code: %d %s", code, stdout)
				}
				data, err := os.ReadFile(path)
				if err != nil {
					t.Fatal(err)
				}
				var trace types.ValidationTrace
				if err := json.Unmarshal(data, &trace); err != nil {
					t.Fatal(err)
				}
				if trace.Version != 1 || trace.Concurrency != 2 || trace.StartedAt.IsZero() || len(trace.Rules) != 3 || len(trace.Events) < 2 ||
					trace.Rules[0].RuleID != "agency_file_exists" || trace.Rules[0].Severity != types.SEVERITY_ERROR ||
					!slices.Equal(trace.Rules[1].DependsOn, []string{"agency_file_exists"}) {
					t.Fatalf("invalid trace metadata: %+v", trace)
				}
				var elapsed int64
				states := map[string]types.TraceEvent{}
				for _, event := range trace.Events {
					if event.ElapsedNS < elapsed {
						t.Fatal("timestamps went backwards")
					}
					elapsed = event.ElapsedNS
					if event.Kind == "rule_finished" || event.Kind == "rule_skipped" {
						states[event.RuleID] = event
					}
				}
				last := trace.Events[len(trace.Events)-1]
				if trace.Events[0].Kind != "run_started" || last.Kind != "run_finished" || last.Status != test.runState ||
					len(states) != 3 || states["agency_file_exists"].Status != string(test.first) ||
					states["agency_name_exists"].Status != string(test.child) || states["agency_url_valid"].Status != "skipped" {
					t.Fatalf("wrong terminal states: %+v, %+v", states, last)
				}
				if test.name == "blocked" && (!slices.Equal(states["agency_name_exists"].BlockedBy, []string{"agency_file_exists"}) ||
					states["agency_file_exists"].FindingCount != 1 || states["agency_url_valid"].Reason != "rule ignored") {
					t.Fatalf("wrong rule details: %+v", states)
				}
			})
		}
		blockedOutput := exec.Command(binary, "-path", feed, "-rules", config, "-trace", directory)
		var traceStderr bytes.Buffer
		blockedOutput.Stderr = &traceStderr
		stdout, err := blockedOutput.Output()
		exit, ok := err.(*exec.ExitError)
		if !ok || exit.ExitCode() != 2 || !json.Valid(stdout) || !strings.Contains(traceStderr.String(), "write trace") {
			t.Fatalf("trace write failure: %v, stdout %q, stderr %q", err, stdout, traceStderr.String())
		}
	})
	t.Run("unknown rule", func(t *testing.T) {
		config := write("unknown-rule.json", []byte(`[{"rule_id":"test_rule","severity":"error"}]`))
		command := exec.Command(binary, "-path", feed, "-rules", config)
		var stdout, stderr bytes.Buffer
		command.Stdout = &stdout
		command.Stderr = &stderr
		if err := command.Run(); err != nil {
			t.Fatalf("unknown rule aborted execution: %v: %s", err, stderr.String())
		}
		var report types.Summary
		if err := json.Unmarshal(stdout.Bytes(), &report); err != nil {
			t.Fatal(err)
		}
		if report.TotalErrors != 0 || report.TotalWarnings != 1 || len(report.Messages) != 1 ||
			report.Messages[0].RuleID != "test_rule" || report.Messages[0].Severity != types.SEVERITY_WARNING {
			t.Fatalf("expected one warning for the missing rule: %+v", report)
		}
	})
}
