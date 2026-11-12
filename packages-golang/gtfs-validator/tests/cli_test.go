package gtfsvalidator_test

import (
	"bytes"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
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
		{"placeholder on missing agency", []string{"-path", emptyFeed, "-rules", rulesPath}, 0, true},
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
				if report.Messages == nil || len(report.Messages) != 0 || report.TotalErrors != 0 || report.TotalWarnings != 0 {
					t.Fatal("unexpected report", stdout.String())
				}
			} else if stdout.Len() != 0 {
				t.Fatal("unexpected stdout", stdout.String())
			}
		})
	}
}
