package gtfsvalidator_test

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"testing"
)

// Exercise the actual standalone entry point, including its output streams and exit codes.
func TestCLI(t *testing.T) {
	directory := t.TempDir()
	binary := filepath.Join(directory, "gtfs-validator")
	// Match the package build script: -w omits DWARF debug information, which
	// these CLI checks do not need and can fail to link on macOS with SQLite.
	build := exec.Command("go", "build", "-ldflags=-w", "-o", binary, "../src/cli.go")
	if output, err := build.CombinedOutput(); err != nil {
		t.Fatalf("build: %s: %v", output, err)
	}

	// Build tiny archives on disk so the subprocess uses the same input as a user.
	archive := func(name string, includeAgency bool) string {
		path := filepath.Join(directory, name)
		file, err := os.Create(path)
		if err != nil {
			t.Fatal(err)
		}

		writer := zip.NewWriter(file)
		if includeAgency {
			entry, err := writer.Create("agency.txt")
			if err != nil {
				t.Fatal(err)
			}

			entry.Write([]byte("agency_name\nExample\n"))
		}

		if err := writer.Close(); err != nil {
			t.Fatal(err)
		}

		if err := file.Close(); err != nil {
			t.Fatal(err)
		}

		return path
	}

	valid := archive("valid.zip", true)
	invalid := archive("invalid.zip", false)

	// Each named case launches the actual binary and checks its process contract.
	for _, test := range []struct {
		name   string
		args   []string
		exit   int
		report bool
	}{
		{"valid", []string{"-path", valid, "-config", `{"future_setting":true}`, "-concurrency", "2"}, 0, true},
		{"invalid feed", []string{"-path", invalid}, 1, true},
		{"import error", []string{"-path", filepath.Join(directory, "missing.zip")}, 2, true},
		{"no source", nil, 2, false},
		{"both sources", []string{"-path", valid, "-url", "https://example.invalid/feed.zip"}, 2, false},
		{"null config", []string{"-path", valid, "-config", "null"}, 2, false},
		{"array config", []string{"-path", valid, "-config", "[]"}, 2, false},
		{"invalid config", []string{"-path", valid, "-config", "{"}, 2, false},
		{"trailing JSON", []string{"-path", valid, "-config", "{} {}"}, 2, false},
		{"concurrency", []string{"-path", valid, "-concurrency", "0"}, 2, false},
		{"positional", []string{"-path", valid, "extra"}, 2, false},
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

			// Capturing streams separately catches accidental log output in JSON stdout.
			if test.report {
				var report struct {
					Messages    []json.RawMessage `json:"messages"`
					TotalErrors int               `json:"total_errors"`
				}

				if err := json.Unmarshal(stdout.Bytes(), &report); err != nil {
					t.Fatalf("stdout is not a JSON report: %s", stdout.String())
				}

				if report.Messages == nil {
					t.Fatal("incomplete rule report", stdout.String())
				}

				if code == 1 && report.TotalErrors == 0 {
					t.Fatal("missing findings")
				}

				if code == 2 && stderr.Len() == 0 {
					t.Fatal("missing operational error")
				}
			} else if stdout.Len() != 0 {
				t.Fatal("unexpected stdout", stdout.String())
			}
		})
	}
}
