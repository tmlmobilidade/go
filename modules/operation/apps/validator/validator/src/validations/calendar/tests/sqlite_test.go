package calendar

import (
	"database/sql"
	"main/services"
	"path/filepath"
	"testing"
)

func calendarTable(t *testing.T, setup string) (*sql.DB, *services.SQLiteTable) {
	t.Helper()
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "feed.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	if _, err := db.Exec(setup); err != nil {
		t.Fatal(err)
	}
	table, err := services.NewSQLiteTable(db, "calendar")
	if err != nil {
		t.Fatal(err)
	}
	services.AppMessageService.Clear()
	t.Cleanup(services.AppMessageService.Clear)
	return db, table
}
