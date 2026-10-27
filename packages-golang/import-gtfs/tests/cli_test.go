package importgtfs_test

import (
	"archive/zip"
	"bytes"
	"database/sql"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func TestCLIJSONConfig(t *testing.T) {
	binary := filepath.Join(t.TempDir(), "import-gtfs")
	if output, err := exec.Command("go", "build", "-ldflags=-w", "-o", binary, "../src/cli.go").CombinedOutput(); err != nil {
		t.Fatalf("build CLI: %v\n%s", err, output)
	}
	archivePath := filepath.Join(t.TempDir(), "gtfs.zip")
	archive, err := os.Create(archivePath)
	if err != nil {
		t.Fatal(err)
	}
	writer := zip.NewWriter(archive)
	file, err := writer.Create("stops.txt")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := file.Write([]byte("stop_id\n001\n")); err != nil {
		t.Fatal(err)
	}
	file, err = writer.Create("calendar_dates.txt")
	requireNoError(t, err)
	_, err = file.Write([]byte("service_id,date,exception_type\n001,20261001,1\n001,20261027,1\n001,20261031,1\n"))
	requireNoError(t, err)
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}
	if err := archive.Close(); err != nil {
		t.Fatal(err)
	}
	outputPath := filepath.Join(t.TempDir(), "output.db")
	config, err := json.Marshal(map[string]any{
		"source":        map[string]string{"url": "invalid-url"},
		"sqlite_config": map[string]any{"instancePath": "ignored.db", "memory": true},
		"time_range": map[string]any{
			"date_range":     map[string]int{"start": 20261001, "end": 20261031},
			"discrete_dates": []int{20261027, 20261101},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	// Explicit flags replace the JSON source and override both string and boolean settings.
	command := exec.Command(binary, "-config", string(config), "-path", archivePath, "-instance-path", outputPath, "-memory=false")
	var diagnostics bytes.Buffer
	command.Stderr = &diagnostics
	command.Env = append(os.Environ(), "ENVIRONMENT=prd")
	output, err := command.Output()
	if err != nil {
		t.Fatalf("JSON import failed: %v", err)
	}
	if strings.TrimSpace(string(output)) != outputPath {
		t.Fatalf("unexpected output: %s", output)
	}
	var completion struct {
		Body       string         `json:"body"`
		Attributes map[string]any `json:"attributes"`
	}
	lines := strings.Split(strings.TrimSpace(diagnostics.String()), "\n")
	for _, line := range lines {
		if err := json.Unmarshal([]byte(line), &completion); err != nil {
			t.Fatalf("invalid telemetry: %v: %s", err, line)
		}
	}
	if !strings.HasPrefix(completion.Body, "GTFS tables imported in ") || completion.Attributes["elapsed_ms"] == nil {
		t.Fatalf("missing completion telemetry: %s", diagnostics.String())
	}
	contents, err := os.ReadFile(outputPath)
	if err != nil || !strings.HasPrefix(string(contents), "SQLite format 3") {
		t.Fatalf("missing SQLite output: %v", err)
	}
	database, err := sql.Open("sqlite3", outputPath)
	requireNoError(t, err)
	defer database.Close()
	var count int
	var date, exception string
	requireNoError(t, database.QueryRow("SELECT COUNT(*), date, exception_type FROM calendar_dates").Scan(&count, &date, &exception))
	if count != 1 || date != "20261027" || exception != "1" {
		t.Fatalf("JSON time_range not applied: %d, %s, %s", count, date, exception)
	}
	config, err = json.Marshal(map[string]any{
		"source":        map[string]string{"path": archivePath},
		"sqlite_config": map[string]string{"instancePath": outputPath},
	})
	if err != nil {
		t.Fatal(err)
	}
	output, err = exec.Command(binary, "-config", string(config)).Output()
	if err != nil || strings.TrimSpace(string(output)) != outputPath {
		t.Fatalf("JSON-only import failed: %v, %s", err, output)
	}
	// Memory mode emits a SQLite image instead of a path, without temporary output.
	memoryCommand := exec.Command(binary, "-path", archivePath, "-memory")
	memoryCommand.Env = append(os.Environ(), "ENVIRONMENT=dev", "TMPDIR="+filepath.Join(t.TempDir(), "missing"))
	diagnostics.Reset()
	memoryCommand.Stderr = &diagnostics
	memoryOutput, err := memoryCommand.Output()
	requireNoError(t, err)
	if !strings.HasPrefix(string(memoryOutput), "SQLite format 3\x00") {
		t.Fatalf("expected binary SQLite output, got %q", memoryOutput)
	}
	if !strings.Contains(diagnostics.String(), "✓ GTFS tables imported in ") {
		t.Fatalf("missing development telemetry: %s", diagnostics.String())
	}
	for _, config := range []string{"", "{", `{} {}`, `{"unknown":true}`, `{"source":{"path":3}}`, `{"sqlite_config":{"databaseInstance":{}}}`} {
		command := exec.Command(binary, "-config", config)
		command.Env = append(os.Environ(), "ENVIRONMENT=prd")
		output, err := command.CombinedOutput()
		if exit, ok := err.(*exec.ExitError); !ok || exit.ExitCode() != 2 {
			t.Fatalf("config %q: expected exit 2, got %v: %s", config, err, output)
		}
		var diagnostic struct {
			Severity_text string `json:"severity_text"`
		}
		line := strings.SplitN(string(output), "\n", 2)[0]
		if err := json.Unmarshal([]byte(line), &diagnostic); err != nil || diagnostic.Severity_text != "ERROR" {
			t.Fatalf("config %q: expected telemetry error, got %s", config, output)
		}
	}
}
