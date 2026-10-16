package services

import (
	"database/sql"
	"errors"
	"path/filepath"
	"reflect"
	"testing"
)

func sqliteContextFixture(t *testing.T) (*sql.DB, *SQLiteTable) {
	t.Helper()
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "feed.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	_, err = db.Exec(`CREATE TABLE "custom-table" (agency_id TEXT, agency_name TEXT, "extra""field" TEXT);
		INSERT INTO "custom-table" VALUES ('001', 'Agency One', 'untouched'), ('001', '', NULL);
		INSERT INTO "custom-table" (rowid, agency_id) VALUES (5, '005');`)
	if err != nil {
		t.Fatal(err)
	}
	table, err := NewSQLiteTable(db, "custom-table")
	if err != nil {
		t.Fatal(err)
	}
	return db, table
}

func TestSQLiteRowReadsRequestedFieldsWithoutCachingValues(t *testing.T) {
	db, table := sqliteContextFixture(t)
	row := table.At(0)
	values, err := row.Fields("agency_id", "absent", `extra"field`)
	want := map[string]string{"agency_id": "001", "absent": "", `extra"field`: "untouched"}
	if err != nil || !reflect.DeepEqual(values, want) {
		t.Fatalf("fields = %#v, error = %v", values, err)
	}
	value, count, err := row.FieldWithCount("agency_id")
	if err != nil || value != "001" || count != 2 {
		t.Fatalf("value = %q, count = %d, error = %v", value, count, err)
	}
	if _, err := db.Exec(`UPDATE "custom-table" SET agency_id = '002' WHERE rowid = 1`); err != nil {
		t.Fatal(err)
	}
	value, count, err = row.FieldWithCount("agency_id")
	if err != nil || value != "002" || count != 1 {
		t.Fatalf("stale result: value = %q, count = %d, error = %v", value, count, err)
	}
	if value, err := row.Field("agency_id"); err != nil || value != "002" {
		t.Fatalf("field = %q, error = %v", value, err)
	}
	for _, field := range []string{"agency_name", `extra"field`, "absent"} {
		if value, err := table.At(1).Field(field); err != nil || value != "" {
			t.Fatalf("empty field %s = %q, error = %v", field, value, err)
		}
	}
	if value, count, err := row.FieldWithCount("absent"); err != nil || value != "" || count != 0 {
		t.Fatalf("absent field = %q, count = %d, error = %v", value, count, err)
	}
	if _, err := row.Fields(); err == nil {
		t.Fatal("empty field request accepted")
	}
	if _, err := table.At(99).Field("agency_id"); !errors.Is(err, sql.ErrNoRows) {
		t.Fatalf("missing row error = %v", err)
	}
	db.Close()
	if _, err := row.Field("agency_id"); err == nil {
		t.Fatal("database failure was hidden")
	}
}

func TestSQLiteTableIterationAllowsFieldQueriesAndPreservesRowNumbers(t *testing.T) {
	_, table := sqliteContextFixture(t)
	var indexes []int
	if err := table.ForEachRow(func(row *SQLiteRow) error {
		indexes = append(indexes, row.Row)
		_, err := row.Field("agency_id")
		return err
	}); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(indexes, []int{0, 1, 4}) {
		t.Fatalf("row indexes = %v", indexes)
	}
	sentinel := errors.New("stop iteration")
	if err := table.ForEachRow(func(*SQLiteRow) error { return sentinel }); !errors.Is(err, sentinel) {
		t.Fatalf("callback error = %v", err)
	}
}
