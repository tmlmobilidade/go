package queries_test

import (
	"database/sql"
	"fmt"
	"path/filepath"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
	_ "modernc.org/sqlite"
)

func TestForEachRowFieldsReleasesBatchesAndReadsUncachedFields(t *testing.T) {
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "gtfs.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	db.SetMaxOpenConns(1)
	// Cross two batch boundaries with sparse row IDs and imported NULL values.
	if _, err := db.Exec(`CREATE TABLE trips(shape_id TEXT, pattern_id TEXT, optional TEXT);
		WITH RECURSIVE numbers(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM numbers WHERE n < 1025)
		INSERT INTO trips(rowid,shape_id,pattern_id) SELECT n*2, 'S'||n, 'P'||n FROM numbers`); err != nil {
		t.Fatal(err)
	}
	tables, err := queries.LoadSQLiteTables(db)
	if err != nil {
		t.Fatal(err)
	}
	count := 0
	err = queries.ForEachRowFields(tables.Tables["trips"], []string{"shape_id"}, func(row *sqliteTypes.SQLiteRow) error {
		count++
		if row.Row != count*2-1 {
			t.Fatalf("row = %d, want %d", row.Row, count*2-1)
		}
		// The cursor must be closed for this fallback read to use the only connection.
		values, err := queries.Fields(row, "shape_id", "pattern_id", "optional", "missing")
		if err != nil {
			return err
		}
		if values["shape_id"] != fmt.Sprintf("S%d", count) || values["pattern_id"] != fmt.Sprintf("P%d", count) || values["optional"] != "" || values["missing"] != "" {
			t.Fatalf("incorrect cached/uncached values: %+v", values)
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if count != 1025 {
		t.Fatalf("read %d rows, want 1025", count)
	}
}
