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

	validator "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	importgtfs "github.com/tmlmobilidade/go/packages-golang/import-gtfs/src"
)

func agencyRules() []types.Rule {
	return []types.Rule{
		{RuleID: "agency_name_valid", Severity: types.SEVERITY_ERROR, DependsOn: []string{"agency_name_field"}},
		{RuleID: "agency_file_missing", Severity: types.SEVERITY_ERROR},
		{RuleID: "agency_name_field", Severity: types.SEVERITY_ERROR, DependsOn: []string{"agency_file_missing"}},
	}
}

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

// Both placeholder runs and import failures must remove the temporary database.
func TestValidateLocalAndCleanup(t *testing.T) {
	temp := t.TempDir()
	t.Setenv("TMPDIR", temp)
	for _, test := range []struct {
		name  string
		files map[string]string
	}{
		{"valid", map[string]string{"agency.txt": "agency_name\nExample\n"}},
		{"missing file", map[string]string{}},
		{"missing field", map[string]string{"agency.txt": "agency_id\n1\n"}},
	} {
		t.Run(test.name, func(t *testing.T) {
			path := filepath.Join(temp, "feed.zip")
			if err := os.WriteFile(path, archive(t, test.files), 0600); err != nil {
				t.Fatal(err)
			}

			report, err := validator.GtfsValidator(context.Background(), validator.Options{
				Source: importgtfs.ImportGtfsConfigSource{Path: path}, Concurrency: 3, Rules: agencyRules(),
			})
			if err != nil || report.TotalErrors != 0 || len(report.Messages) != 0 {
				t.Fatal(report, err)
			}

			entries, _ := filepath.Glob(filepath.Join(temp, "gtfs-validator-*"))
			if len(entries) != 0 {
				t.Fatal("leaked database", entries)
			}
		})
	}

	// Malformed CSV is an import failure, which must clean up the database too.
	path := filepath.Join(temp, "bad.zip")
	if err := os.WriteFile(path, archive(t, map[string]string{"agency.txt": "agency_name\n\"unterminated"}), 0600); err != nil {
		t.Fatal(err)
	}
	report, err := validator.GtfsValidator(context.Background(), validator.Options{
		Source: importgtfs.ImportGtfsConfigSource{Path: path}, Rules: agencyRules(),
	})
	if err == nil || errors.Is(err, rules.ErrInvalidConfiguration) || len(report.Messages) != 0 {
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
	options := validator.Options{Source: importgtfs.ImportGtfsConfigSource{Url: server.URL}, Rules: agencyRules()}
	report, err := validator.GtfsValidator(context.Background(), options)
	if err != nil || report.TotalErrors != 0 || len(report.Messages) != 0 {
		t.Fatal(report, err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	_, err = validator.GtfsValidator(ctx, options)
	if !errors.Is(err, context.Canceled) {
		t.Fatal(err)
	}
}

func TestRejectsRulesBeforeImport(t *testing.T) {
	config := agencyRules()
	config[0].DependsOn = []string{"agency_id_unique"}
	_, err := validator.GtfsValidator(context.Background(), validator.Options{
		Source: importgtfs.ImportGtfsConfigSource{Path: filepath.Join(t.TempDir(), "missing.zip")},
		Rules:  config,
	})
	if !errors.Is(err, rules.ErrInvalidConfiguration) {
		t.Fatalf("expected a configuration error before opening the ZIP, got %v", err)
	}
}
