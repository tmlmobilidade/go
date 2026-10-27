package sqlite_test

import (
	"bytes"
	"database/sql"
	"os"
	"path/filepath"
	"reflect"
	"testing"

	sqlite "github.com/tmlmobilidade/go/packages-golang/sqlite/src"
)

type testRow struct {
	ID      string  `json:"id"`
	Enabled bool    `db:"enabled"`
	Count   int64   `json:"count"`
	Data    []byte  `json:"data"`
	Label   *string `json:"label"`
}

func requireNoError(t *testing.T, err error) {
	t.Helper()
	if err != nil {
		t.Fatal(err)
	}
}

func TestSQLiteDatabase(t *testing.T) {
	database, err := sqlite.NewSQLiteDatabase(sqlite.SQLiteDatabaseConfig{Memory: true})
	requireNoError(t, err)
	t.Cleanup(func() { requireNoError(t, database.Cleanup()) })
	table, err := sqlite.RegisterTable(database, "test rows", sqlite.SQLiteTable[testRow]{
		Batch_size: 2,
		Columns: []sqlite.SQLiteColumn[testRow]{
			{Name: "id", Type: "TEXT", Indexed: true},
			{Name: "enabled", Type: "BOOLEAN"},
			{Name: "count", Type: "INTEGER"},
			{Name: "data", Type: "BLOB"},
			{Name: "label", Type: "TEXT"},
		},
	})
	requireNoError(t, err)
	if _, err := sqlite.RegisterTable(database, "test rows", sqlite.SQLiteTable[testRow]{}); err == nil {
		t.Fatal("duplicate registration succeeded")
	}
	label := "hello"
	first := testRow{ID: "a", Enabled: true, Count: 7, Data: []byte{0, 1, 255}, Label: &label}
	requireNoError(t, table.Write(first))
	size, err := table.Size()
	requireNoError(t, err)
	if size != 0 {
		t.Fatal("buffered row visible before flush")
	}
	requireNoError(t, table.Write(testRow{ID: "b", Count: 9}))
	rows, err := table.All("ORDER BY id")
	requireNoError(t, err)
	if len(rows) != 2 || !reflect.DeepEqual(rows[0], first) || rows[1].Label != nil {
		t.Fatalf("unexpected rows: %+v", rows)
	}
	row, err := table.Get("id", "a")
	requireNoError(t, err)
	if row == nil || !bytes.Equal(row.Data, first.Data) {
		t.Fatalf("unexpected row: %+v", row)
	}
	row, err = table.Get("id", "missing")
	requireNoError(t, err)
	if row != nil {
		t.Fatal("missing row found")
	}
	for id, expected := range map[string]bool{"a": true, "missing": false} {
		has, err := table.Has("id", id)
		requireNoError(t, err)
		if has != expected {
			t.Fatalf("Has(%q) = %v", id, has)
		}
	}
	values, err := sqlite.Distinct[string](table, "id")
	requireNoError(t, err)
	if len(values) != 2 {
		t.Fatalf("unexpected distinct values: %v", values)
	}
	rows, err = table.Update("id = ?", map[string]any{"count": 12, "enabled": false}, "a")
	requireNoError(t, err)
	if len(rows) != 1 || rows[0].Count != 12 || rows[0].Enabled {
		t.Fatalf("unexpected update result: %+v", rows)
	}
	type totalRow struct{ Total int }
	totals, err := sqlite.Query[totalRow](database.DatabaseInstance, `SELECT COUNT(*) AS total FROM "test rows"`)
	requireNoError(t, err)
	if len(totals) != 1 || totals[0].Total != 2 {
		t.Fatalf("unexpected query result: %+v", totals)
	}
	for _, err := range table.Stream("") {
		requireNoError(t, err)
		break // Closing early must release the single database connection.
	}
	requireNoError(t, table.Clear())
	size, err = table.Size()
	requireNoError(t, err)
	if size != 0 {
		t.Fatal("clear left rows behind")
	}
	for _, err := range table.Stream("WHERE missing = ?", 1) {
		if err == nil {
			t.Fatal("invalid query succeeded")
		}
	}
}

func TestSQLiteFlushRollback(t *testing.T) {
	database, err := sqlite.NewSQLiteDatabase(sqlite.SQLiteDatabaseConfig{Memory: true})
	requireNoError(t, err)
	t.Cleanup(func() { requireNoError(t, database.Cleanup()) })
	_, err = database.DatabaseInstance.Exec("CREATE TABLE items (id TEXT PRIMARY KEY, value INTEGER)")
	requireNoError(t, err)
	table, err := sqlite.RegisterTable(database, "items", sqlite.SQLiteTable[map[string]any]{
		Columns: []sqlite.SQLiteColumn[map[string]any]{{Name: "id", Type: "TEXT"}, {Name: "value", Type: "INTEGER"}},
	})
	requireNoError(t, err)
	first := map[string]any{"id": "same", "value": int64(3)}
	second := map[string]any{"id": "same"}
	requireNoError(t, table.Write(first))
	requireNoError(t, table.Write(second))
	if err := table.Flush(); err == nil {
		t.Fatal("duplicate primary key succeeded")
	}
	size, err := table.Size()
	requireNoError(t, err)
	if size != 0 {
		t.Fatal("failed batch was partially committed")
	}
	second["id"] = "other"
	requireNoError(t, table.Flush()) // Failed flush must retain its buffer for retry.
	requireNoError(t, table.Flush()) // Empty flush is a no-op.
	rows, err := table.All("ORDER BY id DESC")
	requireNoError(t, err)
	if len(rows) != 2 || !reflect.DeepEqual(rows[0], first) || rows[1]["value"] != nil {
		t.Fatalf("unexpected map rows: %+v", rows)
	}
}

func TestSQLiteMap(t *testing.T) {
	type key string
	type value struct{ Name string }
	m, err := sqlite.NewSQLiteMap[key, value]()
	requireNoError(t, err)
	t.Cleanup(func() { requireNoError(t, m.Cleanup()) })
	keys := []key{"plain", `quote"slash\`, "á🚍", ""}
	for _, key := range keys {
		requireNoError(t, m.Set(key, value{Name: "first"}))
		requireNoError(t, m.Set(key, value{Name: string(key)}))
		result, err := m.Get(key)
		requireNoError(t, err)
		if result == nil || result.Name != string(key) {
			t.Fatalf("Get(%q) = %+v", key, result)
		}
		has, err := m.Has(key)
		requireNoError(t, err)
		if !has {
			t.Fatalf("missing key %q", key)
		}
	}
	size, err := m.Size()
	requireNoError(t, err)
	if size != len(keys) {
		t.Fatalf("size = %d", size)
	}
	seen := make(map[key]value)
	for entry, err := range m.Entries() {
		requireNoError(t, err)
		seen[entry.Key] = entry.Value
	}
	if len(seen) != len(keys) {
		t.Fatalf("entries = %v", seen)
	}
	for key, err := range m.Keys() {
		requireNoError(t, err)
		if seen[key].Name != string(key) {
			t.Fatalf("unexpected key %q", key)
		}
	}
	count := 0
	for _, err := range m.Values() {
		requireNoError(t, err)
		count++
	}
	if count != len(keys) {
		t.Fatalf("values count = %d", count)
	}
	for _, err := range m.Entries() {
		requireNoError(t, err)
		break
	}
	deleted, err := m.Delete(keys[0])
	requireNoError(t, err)
	if !deleted {
		t.Fatal("delete returned false")
	}
	deleted, err = m.Delete(keys[0])
	requireNoError(t, err)
	if deleted {
		t.Fatal("missing key deleted")
	}
	result, err := m.Get(keys[0])
	requireNoError(t, err)
	if result != nil {
		t.Fatal("deleted value found")
	}
	requireNoError(t, m.Clear())
	size, err = m.Size()
	requireNoError(t, err)
	if size != 0 {
		t.Fatal("clear left entries behind")
	}
}

func TestSQLiteFileCleanupAndWriter(t *testing.T) {
	path := filepath.Join(t.TempDir(), "custom.db")
	database, err := sqlite.NewSQLiteDatabase(sqlite.SQLiteDatabaseConfig{InstancePath: path})
	requireNoError(t, err)
	if _, err := os.Stat(path); err != nil {
		t.Fatal(err)
	}
	requireNoError(t, database.Cleanup())
	if _, err := os.Stat(path); !os.IsNotExist(err) {
		t.Fatalf("database file not removed: %v", err)
	}

	writer, err := sqlite.NewSQLiteWriter(sqlite.SQLiteTable[map[string]any]{
		Columns: []sqlite.SQLiteColumn[map[string]any]{{Name: "name", Type: "TEXT"}},
	})
	requireNoError(t, err)
	requireNoError(t, writer.Write(map[string]any{"name": "test"}))
	requireNoError(t, writer.Flush())
	size, err := writer.Size()
	requireNoError(t, err)
	if size != 1 || writer.InstanceName == "" {
		t.Fatal("writer did not initialize or flush")
	}
	requireNoError(t, writer.Cleanup())
	if _, err := os.Stat(writer.InstancePath); !os.IsNotExist(err) {
		t.Fatalf("writer database not removed: %v", err)
	}
}

func TestSQLiteExistingInstance(t *testing.T) {
	db, err := sql.Open("sqlite3", ":memory:")
	requireNoError(t, err)
	database, err := sqlite.NewSQLiteDatabase(sqlite.SQLiteDatabaseConfig{DatabaseInstance: db, Memory: true})
	requireNoError(t, err)
	t.Cleanup(func() { requireNoError(t, database.Cleanup()) })
	if database.DatabaseInstance != db {
		t.Fatal("supplied database replaced")
	}
	for pragma, expected := range map[string]int{"synchronous": 1, "temp_store": 2} {
		var value int
		requireNoError(t, db.QueryRow("PRAGMA "+pragma).Scan(&value))
		if value != expected {
			t.Fatalf("pragma %s = %d", pragma, value)
		}
	}
}
