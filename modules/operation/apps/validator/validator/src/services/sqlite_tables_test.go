package services

import (
	"database/sql"
	"errors"
	"path/filepath"
	"sync"
	"testing"
)

func preparedTablesFixture(t *testing.T) (*sql.DB, *SQLiteTables) {
	t.Helper()
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "prepared.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	db.SetMaxOpenConns(1)
	if _, err := db.Exec(`CREATE TABLE agency (agency_id TEXT);
 CREATE TABLE trips (trip_id TEXT, agency_id TEXT);
 CREATE TABLE "custom-table" (value TEXT);
 INSERT INTO agency VALUES ('A1');
 INSERT INTO trips VALUES ('T1', 'A1');`); err != nil {
		t.Fatal(err)
	}
	tables, err := PrepareSQLiteTables(db)
	if err != nil {
		t.Fatal(err)
	}
	return db, tables
}

func TestPreparedSQLiteTablesShareHandlesAcrossContexts(t *testing.T) {
	db, tables := preparedTablesFixture(t)
	for _, name := range []string{"agency", "trips", "custom-table"} {
		if !tables.Has(name) {
			t.Fatalf("table %s not prepared", name)
		}
	}
	agency, err := tables.Table("agency")
	if err != nil {
		t.Fatal(err)
	}
	trips, err := tables.Table("TRIPS")
	if err != nil {
		t.Fatal(err)
	}
	ctx := agency.At(0).Context()
	other, err := ctx.Table("trips")
	if err != nil || other != trips {
		t.Fatalf("cross-table lookup did not reuse prepared handle: %v", err)
	}
	back, err := trips.At(0).Context().Table("agency")
	if err != nil || back != agency {
		t.Fatalf("reverse lookup did not reuse prepared handle: %v", err)
	}
	if _, err := db.Exec("UPDATE trips SET trip_id = 'T2'"); err != nil {
		t.Fatal(err)
	}
	if value, err := other.At(0).Field("trip_id"); err != nil || value != "T2" {
		t.Fatalf("field values were cached: %q, %v", value, err)
	}
	if _, err := tables.Table("missing"); err == nil {
		t.Fatal("missing table accepted")
	}
	reused, err := ValidationTables(db, tables)
	if err != nil || reused != tables {
		t.Fatalf("validation rebuilt the collection: %v", err)
	}
	// Closing SQLite proves table lookup itself no longer needs a metadata query.
	if err := db.Close(); err != nil {
		t.Fatal(err)
	}
	if cached, err := ctx.Table("trips"); err != nil || cached != trips {
		t.Fatalf("lookup queried SQLite: %v", err)
	}
	if _, err := trips.At(0).Field("trip_id"); err == nil {
		t.Fatal("field read should still query SQLite")
	}
}

func TestPreparedSQLiteTablesSupportConcurrentLookups(t *testing.T) {
	db, tables := preparedTablesFixture(t)
	db.SetMaxOpenConns(4)
	agency, _ := tables.Table("agency")
	var wg sync.WaitGroup
	for range 8 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			ctx := agency.At(0).Context()
			for range 10 {
				trips, err := ctx.Table("trips")
				if err != nil {
					t.Error(err)
					return
				}
				if value, err := trips.At(0).Field("trip_id"); err != nil || value != "T1" {
					t.Errorf("value=%q, error=%v", value, err)
					return
				}
			}
		}()
	}
	wg.Wait()
}

func TestPreparedSQLiteTablesRejectInvalidConnections(t *testing.T) {
	if _, err := PrepareSQLiteTables(nil); err == nil {
		t.Fatal("nil database accepted")
	}
	db, tables := preparedTablesFixture(t)
	other, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "other.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer other.Close()
	if _, err := ValidationTables(other, tables); err == nil {
		t.Fatal("tables from a different database accepted")
	}
	if err := db.Close(); err != nil {
		t.Fatal(err)
	}
	if _, err := PrepareSQLiteTables(db); err == nil {
		t.Fatal("closed database accepted")
	}
}

func TestPreparedSQLiteTablesForEachRow(t *testing.T) {
	db, tables := preparedTablesFixture(t)
	db.SetMaxOpenConns(2)
	count := 0
	err := tables.ForEachRow("trips", func(row *SQLiteRow) error {
		count++
		value, err := row.Field("trip_id")
		if err != nil {
			return err
		}
		if value != "T1" {
			t.Fatalf("trip_id = %q", value)
		}
		return nil
	})
	if err != nil || count != 1 {
		t.Fatalf("count=%d, error=%v", count, err)
	}
	expected := errors.New("stop iteration")
	if err := tables.ForEachRow("trips", func(*SQLiteRow) error { return expected }); !errors.Is(err, expected) {
		t.Fatalf("callback error lost: %v", err)
	}
	if err := tables.ForEachRow("missing", func(*SQLiteRow) error { t.Fatal("missing table iterated"); return nil }); err == nil {
		t.Fatal("missing table accepted")
	}
}
