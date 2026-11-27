package gtfsvalidator_test

import (
	"context"
	"errors"
	"maps"
	"testing"
	"time"

	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

func TestForEachRowAllowsNestedQueriesAcrossBatches(t *testing.T) {
	db := openSQLTestDatabase(t, `
		CREATE TABLE trips (ROWID TEXT, "Trip""ID" TEXT);
		WITH RECURSIVE positions(id) AS (
			VALUES(1) UNION ALL SELECT id + 1 FROM positions WHERE id < 514
		)
		INSERT INTO trips (_rowid_, rowid, "Trip""ID")
		SELECT id, 'extra header', CASE WHEN id = 1 THEN '001' END
		FROM positions WHERE id != 513;
	`)
	ctx, cancel := context.WithTimeout(t.Context(), 5*time.Second)
	defer cancel()

	const column = `trip"id`
	var first map[string]string
	visited := 0
	err := sqlutils.ForEachRow(ctx, db, "trips", []string{column, "rowid", "missing"}, func(row int, values map[string]string) error {
		wantRow := visited
		if visited == 512 {
			wantRow++
		}
		if row != wantRow {
			t.Errorf("visit %d got row %d, want %d", visited, row, wantRow)
		}

		want := map[string]string{column: "", "rowid": "extra header", "missing": ""}
		if visited == 0 {
			want[column] = "001"
			first = values
		}
		if !maps.Equal(values, want) {
			t.Errorf("row %d has %v, want %v", row, values, want)
		}

		if visited == 0 || visited == 512 {
			found, err := sqlutils.Exists(ctx, db, "trips", column, "001")
			if err != nil {
				return err
			}
			if !found {
				t.Error("nested Exists could not find trip 001")
			}
		}
		visited++
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if visited != 513 {
		t.Errorf("visited %d rows, want 513", visited)
	}
	if first[column] != "001" {
		t.Errorf("first row values changed after later scans: %v", first)
	}
}

func TestForEachRowStopsOnCallbackErrorOrCancellation(t *testing.T) {
	db := openSQLTestDatabase(t, "CREATE TABLE trips (id TEXT); INSERT INTO trips VALUES ('1'), ('2');")
	stop := errors.New("stop visiting")
	calls := 0
	err := sqlutils.ForEachRow(t.Context(), db, "trips", nil, func(row int, values map[string]string) error {
		calls++
		if row != 0 || len(values) != 0 {
			t.Errorf("first visit = (%d, %v), want position 0 and no values", row, values)
		}
		return stop
	})
	if !errors.Is(err, stop) || calls != 1 {
		t.Errorf("callback failure returned %v after %d visits", err, calls)
	}

	ctx, cancel := context.WithCancel(t.Context())
	defer cancel()
	calls = 0
	err = sqlutils.ForEachRow(ctx, db, "trips", nil, func(int, map[string]string) error {
		calls++
		cancel()
		return nil
	})
	if !errors.Is(err, context.Canceled) || calls != 1 {
		t.Errorf("cancellation returned %v after %d visits", err, calls)
	}
	if err := sqlutils.ForEachRow(t.Context(), db, "missing", nil, func(int, map[string]string) error {
		t.Error("visited a row in a missing table")
		return nil
	}); err == nil {
		t.Error("ForEachRow accepted a missing table")
	}
}
