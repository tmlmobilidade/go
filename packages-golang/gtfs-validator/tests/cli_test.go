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

// Exercise the standalone entry point, including its output files and exit codes.
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
	read := func(t *testing.T, path string) []byte {
		t.Helper()
		data, err := os.ReadFile(path)
		if err != nil {
			t.Fatal(err)
		}
		return data
	}
	run := func(t *testing.T, args ...string) (int, string) {
		t.Helper()
		command := exec.Command(binary, args...)
		var stdout, stderr bytes.Buffer
		command.Stdout, command.Stderr = &stdout, &stderr
		err := command.Run()
		if stdout.Len() != 0 {
			t.Fatalf("unexpected stdout: %s", &stdout)
		}
		if err != nil {
			if exit, ok := err.(*exec.ExitError); ok {
				return exit.ExitCode(), stderr.String()
			}
			t.Fatal(err)
		}
		return 0, stderr.String()
	}

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
	} {
		t.Run(test.name, func(t *testing.T) {
			path := filepath.Join(t.TempDir(), "result.json")
			code, stderr := run(t, append([]string{"-result", path}, test.args...)...)
			if code != test.exit {
				t.Fatalf("exit %d, want %d: %s", code, test.exit, stderr)
			}
			if code == 2 && stderr == "" {
				t.Fatal("missing error message")
			}

			if test.report {
				data := read(t, path)
				entries, err := os.ReadDir(filepath.Dir(path))
				if err != nil || len(entries) != 1 {
					t.Fatalf("expected only the result file: %v, %v", entries, err)
				}
				var report types.Summary
				if err := json.Unmarshal(data, &report); err != nil {
					t.Fatalf("result file is not a JSON report: %s", data)
				}
				if code == 1 {
					if report.TotalErrors != 1 || report.TotalWarnings != 0 ||
						len(report.Messages) != 1 || report.Messages[0].RuleID != "agency_file_exists" {
						t.Fatal("expected a missing agency finding", string(data))
					}
				} else if report.Messages == nil || len(report.Messages) != 0 || report.TotalErrors != 0 || report.TotalWarnings != 0 {
					t.Fatal("unexpected report", string(data))
				}
				wantLogs := []string{"Starting GTFS validation", "Importing GTFS feed", "Saved validation result"}
				switch code {
				case 0:
					wantLogs = append(wantLogs, "Running 3 validation rules", "[0/3] agency_file_exists started", "[1/3] agency_file_exists passed",
						"3/3 rules resolved, 3 passed", "Report totals: errors 0, warnings 0")
				case 1:
					wantLogs = append(wantLogs, "[1/3] agency_file_exists failed", "agency_name_exists skipped (prerequisite unsuccessful; blocked by agency_file_exists)",
						"3/3 rules resolved, 0 passed, 1 failed, 2 skipped", "Report totals: errors 1, warnings 0")
				case 2:
					wantLogs = append(wantLogs, "Validation aborted during feed import", "0/3 rules resolved")
				}
				for _, message := range wantLogs {
					if !strings.Contains(stderr, message) {
						t.Fatalf("missing console log %q in:\n%s", message, stderr)
					}
				}
			} else if _, err := os.Stat(path); !os.IsNotExist(err) {
				t.Fatalf("unexpected result file: %v", err)
			}
		})
	}
	t.Run("missing result flag", func(t *testing.T) {
		path := filepath.Join(t.TempDir(), "trace.json")
		if code, stderr := run(t, "-path", feed, "-rules", rulesPath, "-trace", path); code != 2 || !strings.Contains(stderr, "-result") {
			t.Fatalf("missing result flag: %d, stderr %q", code, stderr)
		}
		if _, err := os.Stat(path); !os.IsNotExist(err) {
			t.Fatalf("unexpected trace file: %v", err)
		}
	})
	t.Run("help", func(t *testing.T) {
		if code, stderr := run(t, "-help"); code != 0 || !strings.Contains(stderr, "-result RESULT.json") {
			t.Fatalf("help: %d, stderr %q", code, stderr)
		}
	})
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
				dir := t.TempDir()
				path, plain, result := filepath.Join(dir, "trace.json"), filepath.Join(dir, "plain.json"), filepath.Join(dir, "result.json")
				args := []string{"-path", test.input, "-rules", config, "-concurrency", "2"}
				if code, stderr := run(t, append(args, "-result", plain)...); code != test.exit {
					t.Fatalf("validation: %d, stderr %q", code, stderr)
				}
				if code, stderr := run(t, append(args, "-result", result, "-trace", path)...); code != test.exit {
					t.Fatalf("traced validation: %d, stderr %q", code, stderr)
				}
				if !bytes.Equal(read(t, plain), read(t, result)) {
					t.Fatal("trace changed report")
				}
				var trace types.ValidationTrace
				if err := json.Unmarshal(read(t, path), &trace); err != nil {
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
	})
	t.Run("output failures", func(t *testing.T) {
		args := []string{"-path", feed, "-rules", rulesPath}
		path := filepath.Join(t.TempDir(), "output.json")
		if code, stderr := run(t, append(args, "-result", path, "-trace", directory)...); code != 2 || !strings.Contains(stderr, "write trace") || !json.Valid(read(t, path)) {
			t.Fatalf("trace write failure: %d, stderr %q", code, stderr)
		}
		trace := filepath.Join(t.TempDir(), "trace.json")
		if code, stderr := run(t, append(args, "-result", directory, "-trace", trace)...); code != 2 || !strings.Contains(stderr, "write result") || !json.Valid(read(t, trace)) {
			t.Fatalf("result write failure: %d, stderr %q", code, stderr)
		}
		original := read(t, path)
		if code, stderr := run(t, append(args, "-result", path, "-trace", path)...); code != 2 || !strings.Contains(stderr, "different files") || !bytes.Equal(read(t, path), original) {
			t.Fatalf("output path collision: %d, stderr %q", code, stderr)
		}
		if code, stderr := run(t, append(args, "-result", rulesPath)...); code != 2 || !strings.Contains(stderr, "write result") || !bytes.Equal(read(t, rulesPath), data) {
			t.Fatalf("input path collision: %d, stderr %q", code, stderr)
		}
	})
	t.Run("unknown rule", func(t *testing.T) {
		config := write("unknown-rule.json", []byte(`[{"rule_id":"test_rule","severity":"error"}]`))
		path := filepath.Join(t.TempDir(), "result.json")
		if code, stderr := run(t, "-path", feed, "-rules", config, "-result", path); code != 0 {
			t.Fatalf("unknown rule aborted execution: %d, stderr %q", code, stderr)
		}
		var report types.Summary
		if err := json.Unmarshal(read(t, path), &report); err != nil {
			t.Fatal(err)
		}
		if report.TotalErrors != 0 || report.TotalWarnings != 1 || len(report.Messages) != 1 ||
			report.Messages[0].RuleID != "test_rule" || report.Messages[0].Severity != types.SEVERITY_WARNING {
			t.Fatalf("expected one warning for the missing rule: %+v", report)
		}
	})
}
