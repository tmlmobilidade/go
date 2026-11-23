package gtfsvalidator_test

import (
	"database/sql"
	"testing"

	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
	sqlite "github.com/tmlmobilidade/go/packages-golang/sqlite/src"
)

func TestSQLSchemaAndLookup(t *testing.T) {
	db := openSQLTestDatabase(t, `
		CREATE TABLE "Tri""ps" ("Trip""ID" TEXT, "É" TEXT);
		INSERT INTO "Tri""ps" VALUES ('001', NULL), (NULL, NULL), ('O''Brien', NULL);
		CREATE VIEW trips_view AS SELECT * FROM "Tri""ps";
		CREATE TEMP TABLE "Tri""ps" (other_column TEXT);
	`)
	ctx := t.Context()
	const table = `tri"ps`
	const column = `trip"id`

	for _, name := range []string{table, "missing", "trips_view"} {
		if found, err := sqlutils.TableExists(ctx, db, name); err != nil || found != (name == table) {
			t.Errorf("TableExists(%q) = %t, %v", name, found, err)
		}
	}
	for _, check := range []struct {
		table, column string
		want          bool
	}{
		{table, column, true},
		{table, "missing", false},
		{table, "other_column", false},
		{table, "É", true},
		{table, "é", false},
		{"missing", column, false},
		{"trips_view", column, false},
	} {
		found, err := sqlutils.ColumnExists(ctx, db, check.table, check.column)
		if err != nil || found != check.want {
			t.Errorf("ColumnExists(%q, %q) = %t, %v, want %t", check.table, check.column, found, err, check.want)
		}
	}
	if count, err := sqlutils.CountRows(ctx, db, table); err != nil || count != 3 {
		t.Errorf("CountRows = %d, %v, want 3", count, err)
	}
	if _, err := sqlutils.CountRows(ctx, db, "missing"); err == nil {
		t.Error("CountRows accepted a missing table")
	}
	for _, check := range []struct {
		column, value string
		want          bool
	}{
		{column, "001", true},
		{column, "1", false},
		{column, "", false},
		{column, "O'Brien", true},
		{column, "o'brien", false},
		{"missing", "missing", false},
	} {
		found, err := sqlutils.Exists(ctx, db, table, check.column, check.value)
		if err != nil || found != check.want {
			t.Errorf("Exists(%q, %q) = %t, %v, want %t", check.column, check.value, found, err, check.want)
		}
	}
	if _, err := sqlutils.Exists(ctx, db, "missing", column, "001"); err == nil {
		t.Error("Exists accepted a missing table")
	}
}

func openSQLTestDatabase(t *testing.T, setup string) *sql.DB {
	t.Helper()
	database, err := sqlite.NewSQLiteDatabase(sqlite.SQLiteDatabaseConfig{Memory: true})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := database.Cleanup(); err != nil {
			t.Error(err)
		}
	})
	if _, err := database.DatabaseInstance.ExecContext(t.Context(), setup); err != nil {
		t.Fatal(err)
	}
	return database.DatabaseInstance
}
