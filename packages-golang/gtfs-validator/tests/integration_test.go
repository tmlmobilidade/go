package gtfsvalidator_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	validator "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	importgtfs "github.com/tmlmobilidade/go/packages-golang/import-gtfs/src"
)

// Exercise the entire pipeline with a small feed containing an agency, route,
// trip, service calendar, stops, and stop times. No importer, database, or rule
// functions are replaced: the only mock is the GTFS data (and its HTTP server).
func TestIntegrationMockGTFS(t *testing.T) {
	config := integrationRules(t)
	for _, scenario := range []string{"valid feed", "empty agency names", "missing agency file"} {
		t.Run(scenario, func(t *testing.T) {
			files := loadMockGTFS(t, "mock-gtfs")

			expected := types.Summary{Messages: []types.RuleMessage{}}
			switch scenario {
			case "empty agency names":
				files = loadMockGTFS(t, "mock-gtfs-invalid")
			case "missing agency file":
				delete(files, "agency.txt")
			}

			// Package the text fixture as a real ZIP and offer identical bytes over HTTP.
			contents := archive(t, files)
			directory := t.TempDir()
			t.Setenv("TMPDIR", directory)
			sourcePath := filepath.Join(directory, "mock-gtfs.zip")
			if err := os.WriteFile(sourcePath, contents, 0600); err != nil {
				t.Fatal(err)
			}

			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "application/zip")
				_, _ = w.Write(contents)
			}))
			defer server.Close()

			for _, source := range []struct {
				name  string
				input importgtfs.ImportGtfsConfigSource
			}{
				{name: "local", input: importgtfs.ImportGtfsConfigSource{Path: sourcePath}},
				{name: "url", input: importgtfs.ImportGtfsConfigSource{Url: server.URL}},
			} {
				t.Run(source.name, func(t *testing.T) {
					report, err := validator.GtfsValidator(context.Background(), validator.Options{
						Source:      source.input,
						Concurrency: 3,
						Rules:       config,
					})
					if err != nil {
						t.Fatalf("validation did not complete: %v", err)
					}
					if !reflect.DeepEqual(report, expected) {
						t.Fatalf("unexpected report:\n got: %+v\nwant: %+v", report, expected)
					}

					// The source remains intact; all temporary databases and sidecars are gone.
					entries, err := os.ReadDir(directory)
					if err != nil {
						t.Fatal(err)
					}
					if len(entries) != 1 || entries[0].Name() != "mock-gtfs.zip" {
						t.Fatalf("unexpected files after validation: %v", entries)
					}
				})
			}
		})
	}
}

// Build the config from rule files so an unregistered rule fails the integration test.
func integrationRules(t *testing.T) []types.Rule {
	t.Helper()
	entries, err := os.ReadDir(filepath.Join("..", "src", "rules"))
	if err != nil {
		t.Fatal(err)
	}

	config := agencyRules()
	configured := make(map[string]bool, len(config))
	for _, rule := range config {
		configured[rule.RuleID] = true
	}

	for _, entry := range entries {
		name := entry.Name()
		if entry.IsDir() || !strings.HasSuffix(name, ".go") || strings.HasSuffix(name, "_test.go") {
			continue
		}
		switch name {
		case "registry.go", "run-validations.go", "types.go":
			continue
		}

		id := strings.TrimSuffix(name, ".go")
		if !configured[id] {
			config = append(config, types.Rule{RuleID: id, Severity: types.SEVERITY_ERROR})
		}
	}
	return config
}

// Readable CSV fixtures stay in version control; the ZIP is generated at test time.
func loadMockGTFS(t *testing.T, fixture string) map[string]string {
	t.Helper()
	directory := filepath.Join("testdata", fixture)
	entries, err := os.ReadDir(directory)
	if err != nil {
		t.Fatal(err)
	}

	files := make(map[string]string, len(entries))
	for _, entry := range entries {
		contents, err := os.ReadFile(filepath.Join(directory, entry.Name()))
		if err != nil {
			t.Fatal(err)
		}
		files[entry.Name()] = string(contents)
	}
	return files
}
