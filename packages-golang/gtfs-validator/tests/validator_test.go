package gtfsvalidator_test

import (
	"archive/zip"
	"bytes"
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/dag"
	validator "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src"
	importgtfs "github.com/tmlmobilidade/go/packages-golang/import-gtfs/src"
)

// archive creates a real ZIP in memory, avoiding checked-in binary fixtures.
func archive(t *testing.T, files map[string]string) []byte {
	t.Helper()
	var buffer bytes.Buffer
	writer := zip.NewWriter(&buffer)
	for name, contents := range files {
		file, err := writer.Create(name)
		if err != nil {
			t.Fatal(err)
		}

		if _, err = file.Write([]byte(contents)); err != nil {
			t.Fatal(err)
		}
	}

	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}

	return buffer.Bytes()
}

// Test each prerequisite failure and verify the temporary database is removed.
func TestValidateLocalAndCleanup(t *testing.T) {
	temp := t.TempDir()
	t.Setenv("TMPDIR", temp)
	for _, test := range []struct {
		name     string
		files    map[string]string
		statuses []dag.Status
		count    int
	}{
		{"valid", map[string]string{"agency.txt": "agency_name\nExample\n"}, []dag.Status{dag.Passed, dag.Passed, dag.Passed}, 0},
		{"missing file", map[string]string{}, []dag.Status{dag.Failed, dag.Skipped, dag.Skipped}, 1},
		{"missing field", map[string]string{"agency.txt": "agency_id\n1\n"}, []dag.Status{dag.Passed, dag.Failed, dag.Skipped}, 1},
		{"empty names", map[string]string{"agency.txt": "agency_id,agency_name\n1,\n2, \n3,Good\n"}, []dag.Status{dag.Passed, dag.Passed, dag.Failed}, 1},
	} {
		t.Run(test.name, func(t *testing.T) {
			path := filepath.Join(temp, "feed.zip")
			if err := os.WriteFile(path, archive(t, test.files), 0600); err != nil {
				t.Fatal(err)
			}

			report, err := validator.GtfsValidator(context.Background(), validator.Options{Source: importgtfs.ImportGtfsConfigSource{Path: path}, Concurrency: 3})
			if err != nil || report.TotalErrors != test.count || len(report.Rules) != 3 {
				t.Fatal(report, err)
			}

			for i, r := range report.Rules {
				if r.Status != test.statuses[i] {
					t.Fatal(report)
				}
			}

			entries, _ := filepath.Glob(filepath.Join(temp, "gtfs-validator-*"))
			if len(entries) != 0 {
				t.Fatal("leaked database", entries)
			}
		})
	}

	// Malformed CSV is an import failure, which must clean up the database too.
	path := filepath.Join(temp, "bad.zip")
	os.WriteFile(path, archive(t, map[string]string{"agency.txt": "agency_name\n\"unterminated"}), 0600)
	report, err := validator.GtfsValidator(context.Background(), validator.Options{Source: importgtfs.ImportGtfsConfigSource{Path: path}})
	if err == nil || report.Error == "" {
		t.Fatal("expected import failure")
	}

	entries, _ := filepath.Glob(filepath.Join(temp, "gtfs-validator-*"))
	if len(entries) != 0 {
		t.Fatal(entries)
	}
}

// A local HTTP server exercises URL downloading without an external service.
func TestValidateURLAndCancellation(t *testing.T) {
	contents := archive(t, map[string]string{"agency.txt": "agency_name\nRemote\n"})
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.Write(contents) }))
	defer server.Close()
	report, err := validator.GtfsValidator(context.Background(), validator.Options{Source: importgtfs.ImportGtfsConfigSource{Url: server.URL}})
	if err != nil || report.TotalErrors != 0 || len(report.Rules) != 3 {
		t.Fatal(report, err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	_, err = validator.GtfsValidator(ctx, validator.Options{Source: importgtfs.ImportGtfsConfigSource{Url: server.URL}})
	if !errors.Is(err, context.Canceled) {
		t.Fatal(err)
	}
}
