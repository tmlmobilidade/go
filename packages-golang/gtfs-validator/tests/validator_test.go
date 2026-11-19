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
	"strings"
	"testing"

	validator "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	importgtfs "github.com/tmlmobilidade/go/packages-golang/import-gtfs/src"
)

func agencyRules() []types.Rule {
	return []types.Rule{
		{RuleID: "agency_name_valid", Severity: types.SEVERITY_ERROR, DependsOn: []string{"agency_name_exists"}},
		{RuleID: "agency_file_exists", Severity: types.SEVERITY_ERROR},
		{RuleID: "agency_name_exists", Severity: types.SEVERITY_ERROR, DependsOn: []string{"agency_file_exists"}},
	}
}

func TestUnknownRulesWarnAndContinue(t *testing.T) {
	path := filepath.Join(t.TempDir(), "feed.zip")
	if err := os.WriteFile(path, archive(t, map[string]string{"agency.txt": "agency_name\nCarris\n"}), 0600); err != nil {
		t.Fatal(err)
	}
	for _, severity := range []types.Severities{types.SEVERITY_ERROR, types.SEVERITY_IGNORE} {
		t.Run(string(severity), func(t *testing.T) {
			config := append(agencyRules(), types.Rule{RuleID: "TEST_RULE", Severity: severity})
			report, err := validator.GtfsValidator(t.Context(), validator.Options{
				Source: importgtfs.ImportGtfsConfigSource{Path: path}, Rules: config,
			})
			if err != nil {
				t.Fatal(err)
			}
			if report.TotalErrors != 0 || report.TotalWarnings != 1 || len(report.Messages) != 1 {
				t.Fatalf("expected one warning for the missing rule: %+v", report)
			}
			message := report.Messages[0]
			if message.Field != "system" || len(message.Messages) != 1 || message.Messages[0].Field != "system" {
				t.Fatalf("missing-rule warning must use the system field: %+v", message)
			}
			if message.RuleID != "test_rule" || message.Severity != types.SEVERITY_WARNING || len(message.Messages) != 1 || !strings.Contains(message.Messages[0].Message, "no implementation") {
				t.Fatalf("unexpected warning: %+v", message)
			}
		})
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

// Both completed runs and import failures must remove the temporary database.
func TestValidateLocalAndCleanup(t *testing.T) {
	temp := t.TempDir()
	t.Setenv("TMPDIR", temp)
	for _, test := range []struct {
		name     string
		files    map[string]string
		wantRule string
	}{
		{"valid", map[string]string{"agency.txt": "agency_name\nExample\n"}, ""},
		{"missing file", map[string]string{}, "agency_file_exists"},
		{"missing field", map[string]string{"agency.txt": "agency_id\n1\n"}, "agency_name_exists"},
	} {
		t.Run(test.name, func(t *testing.T) {
			path := filepath.Join(temp, "feed.zip")
			if err := os.WriteFile(path, archive(t, test.files), 0600); err != nil {
				t.Fatal(err)
			}

			report, err := validator.GtfsValidator(context.Background(), validator.Options{
				Source: importgtfs.ImportGtfsConfigSource{Path: path}, Concurrency: 3, Rules: agencyRules(),
			})
			if err != nil {
				t.Fatal(err)
			}
			if test.wantRule == "" {
				if report.TotalErrors != 0 || len(report.Messages) != 0 {
					t.Fatal("unexpected findings", report)
				}
			} else if report.TotalErrors != 1 || len(report.Messages) != 1 || report.Messages[0].RuleID != test.wantRule {
				t.Fatalf("expected one %s finding, got %+v", test.wantRule, report)
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

	cause := errors.New("test cancelled during import")
	ctx, cancelWithCause := context.WithCancelCause(t.Context())
	defer cancelWithCause(nil)
	interrupted := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		cancelWithCause(cause)
		w.Write(contents)
	}))
	defer interrupted.Close()
	options.Source.Url = interrupted.URL
	_, trace, err := validator.GtfsValidatorWithTrace(ctx, options)
	if !errors.Is(err, context.Canceled) || trace == nil {
		t.Fatalf("expected a partial trace: %v, %v", trace, err)
	}
	cancellations, skipped := 0, 0
	for _, event := range trace.Events {
		switch event.Kind {
		case "cancelled":
			cancellations++
			if event.Error != cause.Error() {
				t.Fatal(event)
			}
		case "rule_skipped":
			skipped++
		case "rule_started":
			t.Fatalf("rule started after cancellation during import: %+v", event)
		}
	}
	if cancellations != 1 || skipped != len(options.Rules) || trace.Events[len(trace.Events)-1].Status != "aborted" {
		t.Fatalf("unexpected trace: %+v", trace.Events)
	}
}

func TestRejectsRulesBeforeImport(t *testing.T) {
	config := agencyRules()
	config[0].DependsOn = []string{"agency_id_unique"}
	_, trace, err := validator.GtfsValidatorWithTrace(context.Background(), validator.Options{
		Source: importgtfs.ImportGtfsConfigSource{Path: filepath.Join(t.TempDir(), "missing.zip")},
		Rules:  config,
	})
	if !errors.Is(err, rules.ErrInvalidConfiguration) || trace != nil {
		t.Fatalf("expected a configuration error before opening the ZIP, got %v, %v", trace, err)
	}
}
