package importgtfs_test

import (
	"archive/zip"
	"bytes"
	"database/sql"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	sqlite "github.com/tmlmobilidade/go/packages-golang/clients/sqlite/src"
	importgtfs "github.com/tmlmobilidade/go/packages-golang/import-gtfs/src"
)

func requireNoError(t *testing.T, err error) {
	t.Helper()
	if err != nil {
		t.Fatal(err)
	}
}

func makeArchive(t *testing.T, files map[string]string) []byte {
	t.Helper()
	var buffer bytes.Buffer
	writer := zip.NewWriter(&buffer)
	for name, content := range files {
		file, err := writer.Create(name)
		requireNoError(t, err)
		_, err = file.Write([]byte(content))
		requireNoError(t, err)
	}
	requireNoError(t, writer.Close())
	return buffer.Bytes()
}

func localSource(t *testing.T, content []byte) importgtfs.ImportGtfsConfigSource {
	t.Helper()
	path := filepath.Join(t.TempDir(), "gtfs.zip")
	requireNoError(t, os.WriteFile(path, content, 0o600))
	return importgtfs.ImportGtfsConfigSource{Path: path}
}

func TestImportGtfsToDatabase(t *testing.T) {
	// Deliberately incomplete GTFS with custom fields and duplicate identifiers.
	var records bytes.Buffer
	records.WriteString("\xef\xbb\xbfstop_id,custom_field,\"quoted\"\"column\"\r\n")
	for i := 0; i < 3100; i++ {
		fmt.Fprintln(&records, "001,\"line one, café\nline two\",")
	}
	archive := makeArchive(t, map[string]string{
		"nested/stops.txt": records.String(),
		"routes.txt":       "arbitrary_header\nnot-a-route\n",
		"agency.txt":       "anything\n",
		"calendar.txt":     "",
		"unknown.txt":      "ignored\nvalue\n",
		"notes.md":         "ignored",
	})
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.Write(archive) }))
	defer server.Close()

	for _, mode := range []string{"path", "url", "memory", "instance", "memory instance", "temporary"} {
		t.Run(mode, func(t *testing.T) {
			config := importgtfs.ImportGtfsConfig{
				Source:        localSource(t, archive),
				Sqlite_config: sqlite.SQLiteDatabaseConfig{InstancePath: filepath.Join(t.TempDir(), "output.db")},
			}
			switch mode {
			case "url":
				config.Source = importgtfs.ImportGtfsConfigSource{Url: server.URL}
			case "memory":
				config.Sqlite_config.Memory = true
			case "temporary":
				config.Sqlite_config = sqlite.SQLiteDatabaseConfig{InstanceName: "custom"}
			case "instance", "memory instance":
				path := config.Sqlite_config.InstancePath
				if mode == "memory instance" {
					path = ":memory:"
				}
				database, err := sql.Open("sqlite3", path)
				requireNoError(t, err)
				t.Cleanup(func() { database.Close() })
				config.Sqlite_config.DatabaseInstance = database
			}
			path, err := importgtfs.ImportGtfsToDatabase(config)
			requireNoError(t, err)
			if !filepath.IsAbs(path) {
				t.Fatalf("expected absolute path, got %q", path)
			}
			if mode == "memory" || mode == "memory instance" || mode == "temporary" {
				t.Cleanup(func() { os.RemoveAll(filepath.Dir(path)) })
			}
			if mode == "temporary" && filepath.Base(path) != "custom.db" {
				t.Fatalf("instance name ignored: %s", path)
			}
			database, err := sql.Open("sqlite3", path+"?mode=ro")
			requireNoError(t, err)
			defer database.Close()
			var count int
			requireNoError(t, database.QueryRow("SELECT COUNT(*) FROM stops").Scan(&count))
			if count != 3100 {
				t.Fatalf("row count = %d", count)
			}
			var id, value, blank string
			requireNoError(t, database.QueryRow(`SELECT stop_id, custom_field, "quoted""column" FROM stops LIMIT 1`).Scan(&id, &value, &blank))
			if id != "001" || value != "line one, café\nline two" || blank != "" {
				t.Fatalf("values changed: %q, %q, %q", id, value, blank)
			}
			requireNoError(t, database.QueryRow("SELECT COUNT(*) FROM sqlite_master WHERE type = 'table'").Scan(&count))
			if count != 3 {
				t.Fatalf("unexpected tables: %d", count)
			}
			if config.Sqlite_config.DatabaseInstance != nil {
				requireNoError(t, config.Sqlite_config.DatabaseInstance.QueryRow("SELECT COUNT(*) FROM stops").Scan(&count))
				if count != 3100 {
					t.Fatalf("supplied instance missing data: %d", count)
				}
			}
		})
	}
}

func TestImportRollback(t *testing.T) {
	database, err := sql.Open("sqlite3", ":memory:")
	requireNoError(t, err)
	defer database.Close()
	_, err = database.Exec("CREATE TABLE stops (id TEXT); INSERT INTO stops VALUES ('original')")
	requireNoError(t, err)
	archive := makeArchive(t, map[string]string{"stops.txt": "id\nnew\nbad,extra\n"})
	path, err := importgtfs.ImportGtfsToDatabase(importgtfs.ImportGtfsConfig{
		Source:        localSource(t, archive),
		Sqlite_config: sqlite.SQLiteDatabaseConfig{DatabaseInstance: database},
	})
	if err == nil || path != "" {
		t.Fatalf("malformed CSV succeeded: %q, %v", path, err)
	}
	var id string
	requireNoError(t, database.QueryRow("SELECT id FROM stops").Scan(&id))
	var count int
	requireNoError(t, database.QueryRow("SELECT COUNT(*) FROM stops").Scan(&count))
	if id != "original" || count != 1 {
		t.Fatal("failed import changed supplied database")
	}
}

func TestImportSourceErrors(t *testing.T) {
	server := httptest.NewServer(http.NotFoundHandler())
	defer server.Close()
	for _, source := range []importgtfs.ImportGtfsConfigSource{
		{}, {Path: "a", Url: "b"}, {Path: filepath.Join(t.TempDir(), "missing.zip")},
		{Url: server.URL}, localSource(t, []byte("not a zip")),
	} {
		if path, err := importgtfs.ImportGtfsToDatabase(importgtfs.ImportGtfsConfig{Source: source}); err == nil || path != "" {
			t.Fatalf("invalid source succeeded: %+v", source)
		}
	}
}
