package main

import (
	"archive/zip"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func TestCLIJSONConfig(t *testing.T) {
	binary := filepath.Join(t.TempDir(), "import-gtfs")
	if output, err := exec.Command("go", "build", "-o", binary, ".").CombinedOutput(); err != nil {
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
	if _, err := file.Write([]byte("id\n001\n")); err != nil {
		t.Fatal(err)
	}
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
	})
	if err != nil {
		t.Fatal(err)
	}
	// Explicit flags replace the JSON source and override both string and boolean settings.
	command := exec.Command(binary, "-config", string(config), "-path", archivePath, "-instance-path", outputPath, "-memory=false")
	output, err := command.Output()
	if err != nil {
		t.Fatalf("JSON import failed: %v", err)
	}
	if strings.TrimSpace(string(output)) != outputPath {
		t.Fatalf("unexpected output: %s", output)
	}
	contents, err := os.ReadFile(outputPath)
	if err != nil || !strings.HasPrefix(string(contents), "SQLite format 3") {
		t.Fatalf("missing SQLite output: %v", err)
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
	for _, config := range []string{"", "{", `{} {}`, `{"unknown":true}`, `{"source":{"path":3}}`, `{"sqlite_config":{"databaseInstance":{}}}`} {
		command := exec.Command(binary, "-config", config)
		output, err := command.CombinedOutput()
		if exit, ok := err.(*exec.ExitError); !ok || exit.ExitCode() != 2 {
			t.Fatalf("config %q: expected exit 2, got %v: %s", config, err, output)
		}
	}
}
