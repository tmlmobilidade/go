package services

import (
	"archive/zip"
	"context"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
	"time"
)

func writeGTFSArchive(t *testing.T, files map[string]string) string {
	t.Helper()
	file, err := os.Create(filepath.Join(t.TempDir(), "gtfs.zip"))
	if err != nil {
		t.Fatal(err)
	}
	writer := zip.NewWriter(file)
	for name, content := range files {
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
	if err := file.Close(); err != nil {
		t.Fatal(err)
	}
	return file.Name()
}

func TestReadGTFSZipSharedImport(t *testing.T) {
	path := writeGTFSArchive(t, map[string]string{
		"nested/stops.txt":   "\xef\xbb\xbfstop_id,zone_id,stop_code,custom\n001,001,001,\"line one, café\nline two\"\n001,Z1,,\n,,, \n",
		"trips.txt":          "trip_id,route_id\nT1,001\nT2,001\n",
		"calendar.txt":       "service_id,monday\nS1,1\n",
		"agency.txt":         "agency_name\nAgency without an ID field\n",
		"feed_info.txt":      "feed_version\n",
		"vehicles.txt":       "vehicle_id\nV1\nV1\n",
		"municipalities.txt": "municipality_id\nM1\n",
		"archives.txt":       "archive_id\nA1\n",
		"periods.txt":        "period_id\nP1\n",
		"afetacao.txt":       "custom\nvalue\n",
		"unknown.txt":        "ignored\nvalue\n",
	})
	gtfs, err := ReadGTFSZip(path)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		gtfs.Close()
		for _, suffix := range []string{"", "-wal", "-shm"} {
			os.Remove(gtfs.DBPath() + suffix)
		}
	})
	if gtfs.HasTable("unknown") {
		t.Fatal("unknown files should follow the shared importer's filtering")
	}
	for _, table := range []string{"agency", "feed_info", "vehicles", "municipalities", "archives", "periods", "afetacao"} {
		if !gtfs.HasTable(table) {
			t.Fatalf("missing table %s", table)
		}
	}
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
	if _, err := os.Stat(path); err != nil {
		t.Fatalf("source archive must be retained: %v", err)
	}
}

func TestReadGTFSZipFailureCleansTemporaryDatabase(t *testing.T) {
	malformed := writeGTFSArchive(t, map[string]string{
		"stops.txt": "stop_id,stop_name\n001,Stop\n002\n",
	})
	for _, path := range []string{malformed, filepath.Join(t.TempDir(), "missing.zip")} {
		t.Run(filepath.Base(path), func(t *testing.T) {
			temporary := t.TempDir()
			t.Setenv("TMPDIR", temporary)
			t.Setenv("TMP", temporary)
			_, err := ReadGTFSZip(path)
			if err == nil || !strings.Contains(err.Error(), "import GTFS") {
				t.Fatalf("expected shared importer error, got %v", err)
			}
			entries, err := os.ReadDir(temporary)
			if err != nil || len(entries) != 0 {
				t.Fatalf("temporary database leaked after import failure: %v, %v", entries, err)
			}
		})
	}
}
