package gtfsvalidator

import (
	"strings"
	"testing"

	sqlite "github.com/tmlmobilidade/go/packages-golang/sqlite/src"
)

func TestCreateValidationIndexes(t *testing.T) {
	database, err := sqlite.NewSQLiteDatabase(sqlite.SQLiteDatabaseConfig{Memory: true})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { database.Cleanup() })
	db := database.DatabaseInstance
	if _, err := db.Exec(`CREATE TABLE trips (trip_id TEXT, shape_id TEXT);
		CREATE TABLE stop_times (trip_id TEXT);`); err != nil {
		t.Fatal(err)
	}
	if err := createValidationIndexes(t.Context(), db); err != nil {
		t.Fatal(err)
	}

	assertIndex := func(name, want string) {
		t.Helper()
		var columns string
		if err := db.QueryRow(`SELECT COALESCE(group_concat(name ORDER BY seqno), '') FROM pragma_index_info(?)`, name).Scan(&columns); err != nil {
			t.Fatal(err)
		}
		if columns != want {
			t.Errorf("index %s has columns %q, want %q", name, columns, want)
		}
	}
	assertIndex("idx_shapes_shape_id_shape_pt_sequence", "")
	assertIndex("idx_stop_times_trip_id_stop_sequence", "")

	if _, err := db.Exec(`CREATE TABLE shapes (shape_id TEXT, shape_pt_sequence TEXT);
		ALTER TABLE stop_times ADD COLUMN stop_sequence TEXT;`); err != nil {
		t.Fatal(err)
	}
	if err := createValidationIndexes(t.Context(), db); err != nil {
		t.Fatal(err)
	}
	assertIndex("idx_shapes_shape_id_shape_pt_sequence", "shape_id,shape_pt_sequence")
	assertIndex("idx_stop_times_trip_id_stop_sequence", "trip_id,stop_sequence")
	assertIndex("idx_trips_shape_id_trip_id", "shape_id,trip_id")
	assertIndex("idx_trips_trip_id", "trip_id")

	for _, lookup := range []struct{ condition, index string }{
		{"trip_id = ''", "idx_trips_trip_id"},
		{"COALESCE(trip_id, '') = ''", "idx_trips_trip_id_coalesce"},
	} {
		var id, parent, unused int
		var plan string
		if err := db.QueryRow("EXPLAIN QUERY PLAN SELECT * FROM trips WHERE "+lookup.condition).
			Scan(&id, &parent, &unused, &plan); err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(plan, "USING INDEX "+lookup.index+" (") {
			t.Errorf("expected %s for %s, got %s", lookup.index, lookup.condition, plan)
		}
	}
	var missingIndexes int
	if err := db.QueryRow(`SELECT COUNT(*) FROM sqlite_schema WHERE type = 'index' AND name IN
		('idx_trips_pattern_id_coalesce', 'idx_stop_times_location_id', 'idx_agency_agency_id')`).Scan(&missingIndexes); err != nil {
		t.Fatal(err)
	}
	if missingIndexes != 0 {
		t.Error("created indexes for missing tables or columns")
	}
}

func TestCreateValidationIndexesRollsBack(t *testing.T) {
	database, err := sqlite.NewSQLiteDatabase(sqlite.SQLiteDatabaseConfig{Memory: true})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { database.Cleanup() })
	db := database.DatabaseInstance
	// The view has both headers but cannot be indexed, so setup fails after indexing shapes.
	if _, err := db.Exec(`CREATE TABLE shapes (shape_id TEXT, shape_pt_sequence TEXT);
		CREATE VIEW trips AS SELECT 'shape' AS shape_id, 'trip' AS trip_id;`); err != nil {
		t.Fatal(err)
	}
	if err := createValidationIndexes(t.Context(), db); err == nil || !strings.Contains(err.Error(), "create index idx_trips_shape_id_trip_id") {
		t.Fatalf("expected trips index creation to fail, got %v", err)
	}
	var indexes int
	if err := db.QueryRow(`SELECT COUNT(*) FROM pragma_index_list('shapes')`).Scan(&indexes); err != nil {
		t.Fatal(err)
	}
	if indexes != 0 {
		t.Error("shapes index survived rollback")
	}
}
