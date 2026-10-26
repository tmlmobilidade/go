package services

import (
	"database/sql"
	"errors"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

func TestGeometryLookupFields(t *testing.T) {
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "lookups.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	_, err = db.Exec(`CREATE TABLE stop_times (trip_id TEXT, stop_id TEXT);
		INSERT INTO stop_times (rowid, trip_id, stop_id) VALUES
		(9, 'T1', 'B'), (3, 'T1', 'A'), (6, 'T1', NULL),
		(12, NULL, 'null-key'), (13, '', 'empty-key'), (14, 'T2', 'other');
		CREATE TABLE stops (stop_id TEXT);
		CREATE TABLE shapes (shape_id TEXT);
		CREATE TABLE trips (trip_id TEXT);`)
	if err != nil {
		t.Fatal(err)
	}
	tables, err := PrepareSQLiteTables(db)
	if err != nil {
		t.Fatal(err)
	}
	// Preparing twice must be safe, including tables with absent lookup columns.
	if _, err := db.Exec("CREATE TABLE unrelated (value TEXT)"); err != nil {
		t.Fatal(err)
	}
	if _, err := PrepareSQLiteTables(db); err != nil {
		t.Fatal(err)
	}
	table, err := tables.Table("stop_times")
	if err != nil {
		t.Fatal(err)
	}
	for _, key := range []struct{ field, value string }{
		{"trip_id", "T1"}, {"trip_id", ""}, {"trip_id", "' OR 1=1 --"}, {"absent", ""},
	} {
		t.Run(key.field+"/"+key.value, func(t *testing.T) {
			type entry struct {
				Row    int
				Fields map[string]string
			}
			var want, got []entry
			err := table.ForEachMatching(key.field, key.value, func(row *SQLiteRow) error {
				fields, err := row.Fields("stop_id", "absent")
				want = append(want, entry{row.Row, fields})
				return err
			})
			if err != nil {
				t.Fatal(err)
			}
			err = table.ForEachMatchingFields(key.field, key.value, []string{"stop_id", "absent"}, func(row *SQLiteRow, fields map[string]string) error {
				got = append(got, entry{row.Row, fields})
				return nil
			})
			if err != nil {
				t.Fatal(err)
			}
			if !reflect.DeepEqual(got, want) {
				t.Fatalf("got %+v, want %+v", got, want)
			}
		})
	}
	for _, lookup := range [][2]string{{"stop_times", "trip_id"}, {"stops", "stop_id"}, {"shapes", "shape_id"}, {"trips", "trip_id"}} {
		var id, parent, unused int
		var detail string
		query := "EXPLAIN QUERY PLAN SELECT rowid FROM " + lookup[0] + " AS source WHERE COALESCE(source." + lookup[1] + ", '') = ? ORDER BY rowid"
		if err := db.QueryRow(query, "T1").Scan(&id, &parent, &unused, &detail); err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(detail, "SEARCH") || !strings.Contains(detail, "idx_validation_"+lookup[0]+"_"+lookup[1]) {
			t.Fatalf("lookup does not use its index: %s", detail)
		}
	}
	wantErr := errors.New("callback failed")
	if err := table.ForEachMatchingFields("trip_id", "T1", []string{"stop_id"}, func(*SQLiteRow, map[string]string) error { return wantErr }); !errors.Is(err, wantErr) {
		t.Fatalf("callback error = %v", err)
	}
	if err := table.ForEachMatchingFields("trip_id", "T1", nil, nil); err == nil {
		t.Fatal("expected empty projection error")
	}
	if err := db.Close(); err != nil {
		t.Fatal(err)
	}
	if err := table.ForEachMatchingFields("trip_id", "T1", []string{"stop_id"}, nil); err == nil {
		t.Fatal("expected database error")
	}
}

func TestForeignLookupIndexes(t *testing.T) {
	for _, lookup := range [][2]string{
		{"agency", "agency_id"}, {"booking_rules", "booking_rule_id"},
		{"calendar", "service_id"}, {"calendar_dates", "service_id"},
		{"fare_attributes", "fare_id"}, {"levels", "level_id"},
		{"route_networks", "network_id"}, {"routes", "route_id"},
		{"shapes", "shape_id"}, {"stops", "stop_id"},
		{"stops", "zone_id"}, {"stops", "parent_station"}, {"trips", "trip_id"},
	} {
		t.Run(lookup[0]+"/"+lookup[1], func(t *testing.T) {
			db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "foreign.db"))
			if err != nil {
				t.Fatal(err)
			}
			t.Cleanup(func() { db.Close() })
			name, field := lookup[0], lookup[1]
			// Missing reference columns must not prevent validating the feed.
			if _, err := db.Exec("CREATE TABLE " + name + " (other TEXT)"); err != nil {
				t.Fatal(err)
			}
			if _, err := PrepareSQLiteTables(db); err != nil {
				t.Fatal(err)
			}
			if _, err := db.Exec("ALTER TABLE " + name + " ADD COLUMN " + field + " TEXT; INSERT INTO " + name + " (" + field + ") VALUES ('present'), ('present'), (NULL)"); err != nil {
				t.Fatal(err)
			}
			tables, err := PrepareSQLiteTables(db)
			if err != nil {
				t.Fatal(err)
			}
			if _, err := PrepareSQLiteTables(db); err != nil {
				t.Fatal(err)
			}
			table, err := tables.Table(name)
			if err != nil {
				t.Fatal(err)
			}
			for _, tc := range []struct {
				value string
				want  bool
			}{{"present", true}, {"missing", false}, {"PRESENT", false}, {"", false}, {"' OR 1=1 --", false}} {
				if got, err := table.Exists(field, tc.value); err != nil || got != tc.want {
					t.Fatalf("Exists(%q) = %v, %v; want %v", tc.value, got, err, tc.want)
				}
			}
			// NULL must not match an empty string; newly inserted literal values must.
			if _, err := db.Exec("INSERT INTO " + name + " (" + field + ") VALUES ('')"); err != nil {
				t.Fatal(err)
			}
			if got, err := table.Exists(field, ""); err != nil || !got {
				t.Fatalf("empty lookup = %v, %v", got, err)
			}
			query := "SELECT EXISTS(SELECT 1 FROM " + name + " AS source WHERE source." + field + " = ?)"
			if field == "parent_station" {
				// This existing rule uses FieldWithCount instead of Exists.
				query = "SELECT source.parent_station, (SELECT COUNT(*) FROM stops AS other WHERE other.parent_station = source.parent_station) FROM stops AS source WHERE source.rowid = ?"
				if value, count, err := table.At(0).FieldWithCount(field); err != nil || value != "present" || count != 2 {
					t.Fatalf("parent count = %q, %d, %v", value, count, err)
				}
			}
			rows, err := db.Query("EXPLAIN QUERY PLAN "+query, "present")
			if err != nil {
				t.Fatal(err)
			}
			defer rows.Close()
			usedIndex := false
			for rows.Next() {
				var id, parent, unused int
				var detail string
				if err := rows.Scan(&id, &parent, &unused, &detail); err != nil {
					t.Fatal(err)
				}
				if strings.Contains(detail, "SEARCH") && strings.Contains(detail, "idx_validation_foreign_"+name+"_"+field) {
					usedIndex = true
				}
			}
			if err := rows.Err(); err != nil {
				t.Fatal(err)
			}
			if !usedIndex {
				t.Fatal("foreign lookup did not use its index")
			}
		})
	}
}

func TestGeometryIndexesSkipMissingColumns(t *testing.T) {
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "missing.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if _, err := db.Exec("CREATE TABLE stop_times (stop_id TEXT); CREATE TABLE stops (stop_lat TEXT); CREATE TABLE shapes (shape_pt_lat TEXT)"); err != nil {
		t.Fatal(err)
	}
	if _, err := PrepareSQLiteTables(db); err != nil {
		t.Fatal(err)
	}
}
