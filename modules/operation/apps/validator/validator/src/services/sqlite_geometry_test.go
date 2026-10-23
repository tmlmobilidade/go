package services

import (
	"database/sql"
	"errors"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

func TestGeometryLookupFields(t *testing.T) {
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "lookups.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	_, err = db.Exec(`CREATE TABLE stop_times (trip_id TEXT, stop_id TEXT);
		INSERT INTO stop_times (rowid, trip_id, stop_id) VALUES
		(9, 'T1', 'B'), (3, 'T1', 'A'), (6, 'T1', NULL),
		(12, NULL, 'null-key'), (13, '', 'empty-key'), (14, 'T2', 'other');
		CREATE TABLE stops (stop_id TEXT);
		CREATE TABLE shapes (shape_id TEXT);`)
	if err != nil {
		t.Fatal(err)
	}
	tables, err := PrepareSQLiteTables(db)
	if err != nil {
		t.Fatal(err)
	}
	// Preparing twice must be safe, including tables with absent lookup columns.
	if _, err := db.Exec("CREATE TABLE unrelated (value TEXT)"); err != nil {
		t.Fatal(err)
	}
	if _, err := PrepareSQLiteTables(db); err != nil {
		t.Fatal(err)
	}
	table, err := tables.Table("stop_times")
	if err != nil {
		t.Fatal(err)
	}
	for _, key := range []struct{ field, value string }{
		{"trip_id", "T1"}, {"trip_id", ""}, {"trip_id", "' OR 1=1 --"}, {"absent", ""},
	} {
		t.Run(key.field+"/"+key.value, func(t *testing.T) {
			type entry struct {
				Row    int
				Fields map[string]string
			}
			var want, got []entry
			err := table.ForEachMatching(key.field, key.value, func(row *SQLiteRow) error {
				fields, err := row.Fields("stop_id", "absent")
				want = append(want, entry{row.Row, fields})
				return err
			})
			if err != nil {
				t.Fatal(err)
			}
			err = table.ForEachMatchingFields(key.field, key.value, []string{"stop_id", "absent"}, func(row *SQLiteRow, fields map[string]string) error {
				got = append(got, entry{row.Row, fields})
				return nil
			})
			if err != nil {
				t.Fatal(err)
			}
			if !reflect.DeepEqual(got, want) {
				t.Fatalf("got %+v, want %+v", got, want)
			}
		})
	}
	for _, lookup := range [][2]string{{"stop_times", "trip_id"}, {"stops", "stop_id"}, {"shapes", "shape_id"}} {
		var id, parent, unused int
		var detail string
		query := "EXPLAIN QUERY PLAN SELECT rowid FROM " + lookup[0] + " AS source WHERE COALESCE(source." + lookup[1] + ", '') = ? ORDER BY rowid"
		if err := db.QueryRow(query, "T1").Scan(&id, &parent, &unused, &detail); err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(detail, "SEARCH") || !strings.Contains(detail, "idx_validation_"+lookup[0]+"_"+lookup[1]) {
			t.Fatalf("lookup does not use its index: %s", detail)
		}
	}
	wantErr := errors.New("callback failed")
	if err := table.ForEachMatchingFields("trip_id", "T1", []string{"stop_id"}, func(*SQLiteRow, map[string]string) error { return wantErr }); !errors.Is(err, wantErr) {
		t.Fatalf("callback error = %v", err)
	}
	if err := table.ForEachMatchingFields("trip_id", "T1", nil, nil); err == nil {
		t.Fatal("expected empty projection error")
	}
	if err := db.Close(); err != nil {
		t.Fatal(err)
	}
	if err := table.ForEachMatchingFields("trip_id", "T1", []string{"stop_id"}, nil); err == nil {
		t.Fatal("expected database error")
	}
}

func TestGeometryIndexesSkipMissingColumns(t *testing.T) {
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "missing.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if _, err := db.Exec("CREATE TABLE stop_times (stop_id TEXT); CREATE TABLE stops (stop_lat TEXT); CREATE TABLE shapes (shape_pt_lat TEXT)"); err != nil {
		t.Fatal(err)
	}
	if _, err := PrepareSQLiteTables(db); err != nil {
		t.Fatal(err)
	}
}
