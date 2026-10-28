package services

import (
	"archive/zip"
	"context"
	"database/sql"
	"os"
	"path/filepath"
	"reflect"
	"testing"
	"time"

	importgtfs "github.com/tmlmobilidade/go/packages-golang/import-gtfs/src"
	sqlite "github.com/tmlmobilidade/go/packages-golang/sqlite/src"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/config"
)

func TestReadGTFSSQLiteFromImportGtfs(t *testing.T) {
	archivePath := filepath.Join(t.TempDir(), "gtfs.zip")
	archive, err := os.Create(archivePath)
	if err != nil {
		t.Fatal(err)
	}
	writer := zip.NewWriter(archive)
	for name, content := range map[string]string{
		"stops.txt":    "stop_id,zone_id,custom\n001,001,\"line one, café\nline two\"\n001,Z1,\n",
		"trips.txt":    "trip_id,route_id\nT1,001\nT2,001\n",
		"vehicles.txt": "vehicle_id\nV1\nV1\n",
	} {
		entry, err := writer.Create(name)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := entry.Write([]byte(content)); err != nil {
			t.Fatal(err)
		}
	}
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}
	if err := archive.Close(); err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(t.TempDir(), "gtfs.db")
	db, err := sql.Open("sqlite", path)
	if err != nil {
		t.Fatal(err)
	}
	// The producer imports the ZIP; the validator receives only its SQLite path.
	importedPath, err := importgtfs.ImportGtfsToDatabase(importgtfs.ImportGtfsConfig{
		Source:           importgtfs.ImportGtfsConfigSource{Path: archivePath},
		AdditionalTables: config.GTFSTables,
		Sqlite_config:    sqlite.SQLiteDatabaseConfig{DatabaseInstance: db},
	})
	closeErr := db.Close()
	if err != nil {
		t.Fatal(err)
	}
	if closeErr != nil {
		t.Fatal(closeErr)
	}
	path = importedPath

	gtfs, err := ReadGTFSSQLite(path)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { gtfs.Close() })

	for table, expected := range map[string]map[string][]int{
		"stops":    {"001": {0, 1}, "Z1": {1}},
		"trips":    {"001": {0, 1}, "T1": {0}, "T2": {1}},
		"vehicles": {"V1": {0, 1}},
	} {
		if !reflect.DeepEqual(gtfs.IdMap[table], expected) {
			t.Fatalf("%s ID map = %#v, want %#v", table, gtfs.IdMap[table], expected)
		}
		for id, want := range expected {
			rows, err := gtfs.GetRowsById(table, id)
			if err != nil || !reflect.DeepEqual(rows, want) {
				t.Fatalf("%s ID %s rows = %v, %v; want %v", table, id, rows, err, want)
			}
		}
	}
	var value string
	if err := gtfs.DB().QueryRow("SELECT custom FROM stops WHERE rowid = 1").Scan(&value); err != nil || value != "line one, café\nline two" {
		t.Fatalf("multiline custom value = %q, %v", value, err)
	}
	var blank *string
	if err := gtfs.DB().QueryRow("SELECT custom FROM stops WHERE rowid = 2").Scan(&blank); err != nil || blank != nil {
		t.Fatalf("empty field = %v, %v; want NULL", blank, err)
	}
	// Validation issues may be read through a second connection inside a row cursor.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	rows, err := gtfs.DB().QueryContext(ctx, "SELECT rowid FROM stops")
	if err != nil {
		t.Fatal(err)
	}
	if !rows.Next() {
		rows.Close()
		t.Fatal("missing stop rows")
	}
	var count int
	err = gtfs.DB().QueryRowContext(ctx, "SELECT COUNT(*) FROM trips").Scan(&count)
	rows.Close()
	if err != nil || count != 2 {
		t.Fatalf("nested validation query = %d, %v", count, err)
	}
	if _, err := PrepareSQLiteTables(gtfs.DB()); err != nil {
		t.Fatalf("prepare validation indexes: %v", err)
	}
	if err := gtfs.Close(); err != nil {
		t.Fatal(err)
	}
	reopened, err := ReadGTFSSQLite(path)
	if err != nil {
		t.Fatalf("repeat validation: %v", err)
	}
	defer reopened.Close()
	if !reflect.DeepEqual(reopened.IdMap, gtfs.IdMap) {
		t.Fatal("ID map changed on repeat validation")
	}

	if _, err := os.Stat(path); err != nil {
		t.Fatalf("source database must be retained: %v", err)
	}
}

func TestReadGTFSSQLiteRejectsInvalidInput(t *testing.T) {
	malformed := filepath.Join(t.TempDir(), "invalid.db")
	if err := os.WriteFile(malformed, []byte("not a SQLite database"), 0600); err != nil {
		t.Fatal(err)
	}
	missing := filepath.Join(t.TempDir(), "missing.db")
	for _, path := range []string{malformed, missing} {
		if _, err := ReadGTFSSQLite(path); err == nil {
			t.Fatalf("expected error for %s", path)
		}
	}
	if _, err := os.Stat(missing); !os.IsNotExist(err) {
		t.Fatalf("missing input was created: %v", err)
	}
	if data, err := os.ReadFile(malformed); err != nil || string(data) != "not a SQLite database" {
		t.Fatalf("invalid input changed: %v", err)
	}
}
