package services

import (
	"database/sql"
	"errors"
	"fmt"
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

func TestSQLiteContextSelectsAgencyAndOtherTables(t *testing.T) {
	connection, customTable := sqliteContextFixture(t)
	_, err := connection.Exec(`CREATE TABLE agency (agency_email TEXT);
		INSERT INTO agency VALUES ('first@example.com'), ('second@example.com');
		CREATE TABLE routes (route_id TEXT);
		INSERT INTO routes (rowid, route_id) VALUES (5, 'route-five');`)
	if err != nil {
		t.Fatal(err)
	}
	agency, err := NewSQLiteTable(connection, "agency")
	if err != nil {
		t.Fatal(err)
	}
	db := agency.At(1).Context()
	if db.Row != 1 || db.Agency == nil || db.Agency.Row != 1 {
		t.Fatalf("current agency row was not bound: %+v", db)
	}
	if value, err := db.Agency.Field("agency_email"); err != nil || value != "second@example.com" {
		t.Fatalf("agency_email = %q, error = %v", value, err)
	}
	selectedAgency, err := db.Table("agency")
	if err != nil {
		t.Fatal(err)
	}
	if value, err := selectedAgency.At(0).Field("agency_email"); err != nil || value != "first@example.com" {
		t.Fatalf("first agency_email = %q, error = %v", value, err)
	}
	routes, err := db.Table("routes")
	if err != nil {
		t.Fatal(err)
	}
	if value, err := routes.At(4).Field("route_id"); err != nil || value != "route-five" {
		t.Fatalf("route_id = %q, error = %v", value, err)
	}
	custom, err := db.Table("custom-table")
	if err != nil {
		t.Fatal(err)
	}
	if value, err := custom.At(0).Field(`extra"field`); err != nil || value != "untouched" {
		t.Fatalf("custom field = %q, error = %v", value, err)
	}
	if _, err := db.Table("missing_table"); err == nil {
		t.Fatal("missing table must return an error")
	}
	if customTable.At(0).Context().Agency.table != nil {
		t.Fatal("a custom table's row was incorrectly bound as an agency")
	}
	if _, err := connection.Exec("UPDATE agency SET agency_email = 'changed@example.com' WHERE rowid = 2"); err != nil {
		t.Fatal(err)
	}
	if value, err := db.Agency.Field("agency_email"); err != nil || value != "changed@example.com" {
		t.Fatalf("agency context returned a stale value: %q, error = %v", value, err)
	}
}

func TestSQLiteContextBindsCalendarRow(t *testing.T) {
	connection, customTable := sqliteContextFixture(t)
	_, err := connection.Exec(`CREATE TABLE calendar (start_date TEXT);
		INSERT INTO calendar VALUES ('20260101'), ('20261016');`)
	if err != nil {
		t.Fatal(err)
	}
	table, err := NewSQLiteTable(connection, "CALENDAR")
	if err != nil {
		t.Fatal(err)
	}
	db := table.At(1).Context()
	if db.Row != 1 || db.Calendar == nil || db.Calendar.Row != 1 || db.Agency.table != nil {
		t.Fatalf("current calendar row was not bound: %+v", db)
	}
	if value, err := db.Calendar.Field("start_date"); err != nil || value != "20261016" {
		t.Fatalf("start_date = %q, error = %v", value, err)
	}
	if customTable.At(0).Context().Calendar.table != nil {
		t.Fatal("a custom table's row was incorrectly bound as a calendar")
	}
}

func TestSQLiteTableExists(t *testing.T) {
	db, table := sqliteContextFixture(t)
	for _, tc := range []struct {
		name, field, value string
		want               bool
	}{
		{"Present", "agency_id", "001", true},
		{"LaterRow", "agency_id", "005", true},
		{"Absent", "agency_id", "missing", false},
		{"MissingColumn", "missing", "001", false},
		{"NullDoesNotMatchEmpty", `extra"field`, "", false},
		{"QuotedColumn", `extra"field`, "untouched", true},
		{"BoundParameter", "agency_id", "' OR 1=1 --", false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			got, err := table.Exists(tc.field, tc.value)
			if err != nil || got != tc.want {
				t.Fatalf("Exists(%q, %q) = %v, %v; want %v", tc.field, tc.value, got, err, tc.want)
			}
		})
	}
	if err := db.Close(); err != nil {
		t.Fatal(err)
	}
	if _, err := table.Exists("agency_id", "001"); err == nil {
		t.Fatal("database failure was hidden")
	}
}

func TestSQLiteNamedExistsFromRoutes(t *testing.T) {
	connection, _ := sqliteContextFixture(t)
	_, err := connection.Exec(`CREATE TABLE agency (agency_id TEXT);
 INSERT INTO agency VALUES ('A1'), ('A1'), ('O''Brien');
 CREATE TABLE routes (agency_id TEXT);
 INSERT INTO routes (rowid, agency_id) VALUES (8, 'A1');`)
	if err != nil {
		t.Fatal(err)
	}
	for _, prepared := range []bool{false, true} {
		t.Run(fmt.Sprint(prepared), func(t *testing.T) {
			var table *SQLiteTable
			if prepared {
				tables, err := PrepareSQLiteTables(connection)
				if err != nil {
					t.Fatal(err)
				}
				table, err = tables.Table("routes")
				if err != nil {
					t.Fatal(err)
				}
			} else {
				table, err = NewSQLiteTable(connection, "routes")
				if err != nil {
					t.Fatal(err)
				}
			}
			ctx := table.At(7).Context()
			value, err := ctx.Routes.Field("agency_id")
			if err != nil || value != "A1" {
				t.Fatalf("value=%q err=%v", value, err)
			}
			if !ctx.Agency.Exists("agency_id", value) {
				t.Fatal("agency was not found across rows")
			}
			if !ctx.Agency.Exists("agency_id", "O'Brien") {
				t.Fatal("quoted value was not found")
			}
			if ctx.Agency.Exists("agency_id", "missing") || ctx.Agency.Exists("agency_id", "' OR 1=1 --") {
				t.Fatal("unexpected match")
			}
			if _, err := ctx.Agency.Field("agency_id"); err == nil {
				t.Fatal("foreign row was implicitly selected")
			}
			if ctx.Calendar.Exists("service_id", "missing") {
				t.Fatal("missing table matched")
			}
		})
	}
	table, err := NewSQLiteTable(connection, "agency")
	if err != nil {
		t.Fatal(err)
	}
	ctx := table.At(0).Context()
	connection.Close()
	if ctx.Agency.Exists("agency_id", "A1") {
		t.Fatal("closed database matched")
	}
}

func TestSQLiteTableExistsMatching(t *testing.T) {
	connection, table := sqliteContextFixture(t)
	for _, tc := range []struct {
		name   string
		fields map[string]string
		want   bool
	}{
		{"SameRow", map[string]string{"agency_id": "001", "agency_name": "Agency One"}, true},
		{"DifferentRows", map[string]string{"agency_id": "005", "agency_name": "Agency One"}, false},
		{"MissingColumn", map[string]string{"absent": "value"}, false},
		{"QuotedColumn", map[string]string{"extra\"field": "untouched"}, true},
		{"BoundValue", map[string]string{"agency_id": "' OR 1=1 --"}, false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			got, err := table.ExistsMatching(tc.fields)
			if err != nil || got != tc.want {
				t.Fatalf("got %v, %v; want %v", got, err, tc.want)
			}
		})
	}
	if _, err := table.ExistsMatching(nil); err == nil {
		t.Fatal("empty conditions accepted")
	}
	connection.Close()
	if _, err := table.ExistsMatching(map[string]string{"agency_id": "001"}); err == nil {
		t.Fatal("read failure swallowed")
	}
}
