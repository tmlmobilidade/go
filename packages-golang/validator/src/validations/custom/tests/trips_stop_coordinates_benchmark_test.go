package custom_test

import (
	"database/sql"
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/custom/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"path/filepath"
	"testing"
)

// Includes unrelated feed rows so full-table scans are visible, and separates
// first-use geometry construction from repeated trips sharing cached pairs.
func BenchmarkStopCoordinates(b *testing.B) {
	db, err := sql.Open("sqlite", filepath.Join(b.TempDir(), "geometry.db"))
	if err != nil {
		b.Fatal(err)
	}
	b.Cleanup(func() { db.Close() })
	_, err = db.Exec(`
		CREATE TABLE trips (trip_id TEXT, shape_id TEXT);
		INSERT INTO trips VALUES ('T1', 'S1');
		CREATE TABLE stop_times (trip_id TEXT, stop_id TEXT);
		CREATE TABLE stops (stop_id TEXT, stop_lat TEXT, stop_lon TEXT);
		CREATE TABLE shapes (shape_id TEXT, shape_pt_sequence TEXT, shape_pt_lat TEXT, shape_pt_lon TEXT);
		WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i+1 FROM n WHERE i<20000)
		INSERT INTO shapes SELECT 'other', i, '38.7', '-9.1' FROM n;
		WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i+1 FROM n WHERE i<20000)
		INSERT INTO stops SELECT 'other', '38.7', '-9.1' FROM n;
		WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i+1 FROM n WHERE i<20000)
		INSERT INTO stop_times SELECT 'other', 'other' FROM n;
		WITH RECURSIVE n(i) AS (SELECT 0 UNION ALL SELECT i+1 FROM n WHERE i<499)
		INSERT INTO shapes SELECT 'S1', i, 38.7+i*0.0001, '-9.1' FROM n;
	`)
	if err != nil {
		b.Fatal(err)
	}
	for i := 0; i < 20; i++ {
		id := fmt.Sprintf("stop%d", i)
		if _, err := db.Exec("INSERT INTO stops VALUES (?, ?, '-9.1')", id, 38.7+float64(i*25)*0.0001); err != nil {
			b.Fatal(err)
		}
		if _, err := db.Exec("INSERT INTO stop_times VALUES ('T1', ?)", id); err != nil {
			b.Fatal(err)
		}
	}
	tables, err := services.PrepareSQLiteTables(db)
	if err != nil {
		b.Fatal(err)
	}
	table, err := tables.Table("trips")
	if err != nil {
		b.Fatal(err)
	}
	ctx := table.At(0).Context()
	rule := &types.RuleContext{Severity: types.SEVERITY_ERROR}
	previousLevel := lib.AppLogger.Level
	lib.AppLogger.Level = -1
	b.Cleanup(func() { lib.AppLogger.Level = previousLevel })
	for _, warm := range []bool{false, true} {
		name := "Cold"
		if warm {
			name = "Warm"
		}
		b.Run(name, func(b *testing.B) {
			geometry := &validationutils.Geometry{}
			if warm {
				if err := custom.StopCoordinates(ctx, rule, geometry); err != nil {
					b.Fatal(err)
				}
			}
			b.ReportAllocs()
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				if !warm {
					geometry = &validationutils.Geometry{}
				}
				if err := custom.StopCoordinates(ctx, rule, geometry); err != nil {
					b.Fatal(err)
				}
			}
		})
	}
	b.Run("PrepareIndexes", func(b *testing.B) {
		b.ReportAllocs()
		for i := 0; i < b.N; i++ {
			b.StopTimer()
			if _, err := db.Exec(`DROP INDEX IF EXISTS idx_validation_stop_times_trip_id;
				DROP INDEX IF EXISTS idx_validation_stops_stop_id;
				DROP INDEX IF EXISTS idx_validation_shapes_shape_id;`); err != nil {
				b.Fatal(err)
			}
			b.StartTimer()
			if _, err := services.PrepareSQLiteTables(db); err != nil {
				b.Fatal(err)
			}
		}
	})
}
