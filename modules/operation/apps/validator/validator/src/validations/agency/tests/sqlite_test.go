package agency

import (
	"database/sql"
	"main/services"
	dbops "main/services/database"
	"path/filepath"
	"testing"
)

func agencyRow(t *testing.T, index int, fields map[string]*string) *services.SQLiteRow {
	t.Helper()
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "agency.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	headers := []string{"fixture"}
	for field := range fields {
		headers = append(headers, field)
	}
	if err := dbops.CreateTableIfNotExists(db, "agency", headers); err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec("INSERT INTO agency (rowid) VALUES (?)", index+1); err != nil {
		t.Fatal(err)
	}
	for field, value := range fields {
		if _, err := db.Exec("UPDATE agency SET "+dbops.SanitizeColumnName(field)+" = ? WHERE rowid = ?", value, index+1); err != nil {
			t.Fatal(err)
		}
	}
	table, err := services.NewSQLiteTable(db, "agency")
	if err != nil {
		t.Fatal(err)
	}
	return table.At(index)
}

func assertAgencyRead(t *testing.T, err error) {
	t.Helper()
	if err != nil {
		t.Fatal(err)
	}
}
