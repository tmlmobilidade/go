package importgtfs_test

import (
	"archive/zip"
	"bytes"
	"database/sql"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"reflect"
	"testing"

	importgtfs "github.com/tmlmobilidade/go/packages-golang/import-gtfs/src"
	sqlite "github.com/tmlmobilidade/go/packages-golang/sqlite/src"
)

// requireNoError stops the current test when a setup or database operation fails.
// Helper makes Go report the calling line, where the failed operation happened.
func requireNoError(t *testing.T, err error) {
	t.Helper()
	if err != nil {
		t.Fatal(err)
	}
}

// makeArchive creates a ZIP in memory from file names and text contents.
func makeArchive(t *testing.T, files map[string]string) []byte {
	t.Helper()
	var buffer bytes.Buffer
	writer := zip.NewWriter(&buffer)
	for name, content := range files {
		file, err := writer.Create(name)
		requireNoError(t, err)
		_, err = file.Write([]byte(content))
		requireNoError(t, err)
	}
	requireNoError(t, writer.Close())
	return buffer.Bytes()
}

// localSource writes a test ZIP into a directory automatically removed after the test.
func localSource(t *testing.T, content []byte) importgtfs.ImportGtfsConfigSource {
	t.Helper()
	path := filepath.Join(t.TempDir(), "gtfs.zip")
	requireNoError(t, os.WriteFile(path, content, 0o600))
	return importgtfs.ImportGtfsConfigSource{Path: path}
}

// TestImportGtfsToDatabase checks the same data through each source and output mode.
func TestImportGtfsToDatabase(t *testing.T) {
	// Deliberately incomplete GTFS with custom fields and duplicate identifiers.
	var records bytes.Buffer
	records.WriteString("\xef\xbb\xbfstop_id,custom_field,\"quoted\"\"column\"\r\n")
	for i := 0; i < 3100; i++ {
		fmt.Fprintln(&records, "001,\"line one, café\nline two\",")
	}
	archive := makeArchive(t, map[string]string{
		"nested/stops.txt": records.String(),
		"routes.txt":       "arbitrary_header\nnot-a-route\n",
		"agency.txt":       "anything\n",
		"calendar.txt":     "",
		"unknown.txt":      "ignored\nvalue\n",
		"notes.md":         "ignored",
	})
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.Write(archive) }))
	defer server.Close()

	// Each named subtest imports independently, then opens the resulting file to check it.
	for _, mode := range []string{"path", "url", "memory", "instance", "memory instance", "temporary"} {
		t.Run(mode, func(t *testing.T) {
			config := importgtfs.ImportGtfsConfig{
				Source:        localSource(t, archive),
				Sqlite_config: sqlite.SQLiteDatabaseConfig{InstancePath: filepath.Join(t.TempDir(), "output.db")},
			}
			switch mode {
			case "url":
				config.Source = importgtfs.ImportGtfsConfigSource{Url: server.URL}
			case "memory":
				config.Sqlite_config.Memory = true
			case "temporary":
				config.Sqlite_config = sqlite.SQLiteDatabaseConfig{InstanceName: "custom"}
			case "instance", "memory instance":
				path := config.Sqlite_config.InstancePath
				if mode == "memory instance" {
					path = ":memory:"
				}
				database, err := sql.Open("sqlite3", path)
				requireNoError(t, err)
				t.Cleanup(func() { database.Close() })
				config.Sqlite_config.DatabaseInstance = database
			}

			// Run the import and check the returned output location.
			path, err := importgtfs.ImportGtfsToDatabase(config)
			requireNoError(t, err)
			if !filepath.IsAbs(path) {
				t.Fatalf("expected absolute path, got %q", path)
			}
			if mode == "memory" || mode == "memory instance" || mode == "temporary" {
				t.Cleanup(func() { os.RemoveAll(filepath.Dir(path)) })
			}
			if mode == "temporary" && filepath.Base(path) != "custom.db" {
				t.Fatalf("instance name ignored: %s", path)
			}

			// Reopen read-only and verify row counts, original text, and skipped files.
			database, err := sql.Open("sqlite3", path+"?mode=ro")
			requireNoError(t, err)
			defer database.Close()
			var count int
			requireNoError(t, database.QueryRow("SELECT COUNT(*) FROM stops").Scan(&count))
			if count != 3100 {
				t.Fatalf("row count = %d", count)
			}
			var id, value string
			var blank *string
			requireNoError(t, database.QueryRow(`SELECT stop_id, custom_field, "quoted""column" FROM stops LIMIT 1`).Scan(&id, &value, &blank))
			if id != "001" || value != "line one, café\nline two" || blank != nil {
				t.Fatalf("values changed: %q, %q, %v", id, value, blank)
			}
			requireNoError(t, database.QueryRow("SELECT COUNT(*) FROM sqlite_master WHERE type = 'table'").Scan(&count))
			if count != 3 {
				t.Fatalf("unexpected tables: %d", count)
			}
			if config.Sqlite_config.DatabaseInstance != nil {
				requireNoError(t, config.Sqlite_config.DatabaseInstance.QueryRow("SELECT COUNT(*) FROM stops").Scan(&count))
				if count != 3100 {
					t.Fatalf("supplied instance missing data: %d", count)
				}
			}
		})
	}
}

// TestImportAdditionalTables checks default vehicles support and opt-in custom tables.
func TestImportAdditionalTables(t *testing.T) {
	source := localSource(t, makeArchive(t, map[string]string{
		"stops.txt":           "stop_id\n001\n",
		"nested/vehicles.txt": "vehicle_id,custom\nV1,\n",
		"municipalities.txt":  "municipality_id\nM1\n",
		"unknown.txt":         "custom\nignored\n",
	}))
	for _, additional := range [][]string{nil, {"municipalities"}} {
		database, err := importgtfs.ImportGtfsToMemory(importgtfs.ImportGtfsConfig{
			Source:           source,
			AdditionalTables: additional,
		})
		requireNoError(t, err)
		var count int
		requireNoError(t, database.DatabaseInstance.QueryRow("SELECT COUNT(*) FROM sqlite_schema WHERE type = 'table' AND name = 'vehicles'").Scan(&count))
		if count != 1 {
			t.Fatalf("vehicles table count = %d for additional tables %v", count, additional)
		}
		requireNoError(t, database.DatabaseInstance.QueryRow("SELECT COUNT(*) FROM vehicles WHERE vehicle_id = 'V1'").Scan(&count))
		if count != 1 {
			t.Fatal("vehicles row was not imported")
		}
		requireNoError(t, database.DatabaseInstance.QueryRow("SELECT COUNT(*) FROM sqlite_schema WHERE type = 'table' AND name = 'municipalities'").Scan(&count))
		if count != len(additional) {
			t.Fatalf("municipalities table count = %d for additional tables %v", count, additional)
		}
		requireNoError(t, database.DatabaseInstance.QueryRow("SELECT COUNT(*) FROM stops").Scan(&count))
		if count != 1 {
			t.Fatalf("standard GTFS table missing: %d", count)
		}
		requireNoError(t, database.DatabaseInstance.QueryRow("SELECT COUNT(*) FROM sqlite_schema WHERE type = 'table' AND name = 'unknown'").Scan(&count))
		if count != 0 {
			t.Fatal("unrequested extension was imported")
		}
		requireNoError(t, database.Cleanup())
	}
}

// TestImportEmptyFields distinguishes missing cells from literal spaces, zero, and "NULL".
func TestImportEmptyFields(t *testing.T) {
	archive := makeArchive(t, map[string]string{
		"stops.txt": "id,value,other\n001,previous,previous\n002,,\"\"\n003, ,0\n004,NULL,\n",
	})
	path, err := importgtfs.ImportGtfsToDatabase(importgtfs.ImportGtfsConfig{
		Source:        localSource(t, archive),
		Sqlite_config: sqlite.SQLiteDatabaseConfig{InstancePath: filepath.Join(t.TempDir(), "empty-fields.db")},
	})
	requireNoError(t, err)
	database, err := sql.Open("sqlite3", path)
	requireNoError(t, err)
	defer database.Close()
	rows, err := sqlite.Query[map[string]any](database, "SELECT * FROM stops ORDER BY id")
	requireNoError(t, err)
	expected := []map[string]any{
		{"id": "001", "value": "previous", "other": "previous"},
		{"id": "002", "value": nil, "other": nil},
		{"id": "003", "value": " ", "other": "0"},
		{"id": "004", "value": "NULL", "other": nil},
	}
	if !reflect.DeepEqual(rows, expected) {
		t.Fatalf("unexpected empty field handling: %#v", rows)
	}
}

// TestImportRollback checks that malformed CSV undoes all new rows, keeping existing data.
func TestImportRollback(t *testing.T) {
	database, err := sql.Open("sqlite3", ":memory:")
	requireNoError(t, err)
	defer database.Close()
	_, err = database.Exec("CREATE TABLE stops (id TEXT); INSERT INTO stops VALUES ('original')")
	requireNoError(t, err)
	archive := makeArchive(t, map[string]string{"stops.txt": "id\nnew\nbad,extra\n"})
	path, err := importgtfs.ImportGtfsToDatabase(importgtfs.ImportGtfsConfig{
		Source:        localSource(t, archive),
		Sqlite_config: sqlite.SQLiteDatabaseConfig{DatabaseInstance: database},
	})
	if err == nil || path != "" {
		t.Fatalf("malformed CSV succeeded: %q, %v", path, err)
	}

	// Only the original row should remain after the import fails.
	var id string
	requireNoError(t, database.QueryRow("SELECT id FROM stops").Scan(&id))
	var count int
	requireNoError(t, database.QueryRow("SELECT COUNT(*) FROM stops").Scan(&count))
	if id != "original" || count != 1 {
		t.Fatal("failed import changed supplied database")
	}
}

// TestImportSourceErrors rejects missing, conflicting, unavailable, and invalid ZIP sources.
func TestImportSourceErrors(t *testing.T) {
	server := httptest.NewServer(http.NotFoundHandler())
	defer server.Close()
	for _, source := range []importgtfs.ImportGtfsConfigSource{
		{}, {Path: "a", Url: "b"}, {Path: filepath.Join(t.TempDir(), "missing.zip")},
		{Url: server.URL}, localSource(t, []byte("not a zip")),
	} {
		if path, err := importgtfs.ImportGtfsToDatabase(importgtfs.ImportGtfsConfig{Source: source}); err == nil || path != "" {
			t.Fatalf("invalid source succeeded: %+v", source)
		}
	}
}

// TestImportTimeRange checks date boundaries, individual dates, and combined filters.
func TestImportTimeRange(t *testing.T) {
	archive := makeArchive(t, map[string]string{
		"nested/calendar_dates.txt": "service_id,date,exception_type,custom\n001,20260228,1,keep\n001,20260301,1,keep\n002,20260302,1,keep\n002,20260303,1,keep\n",
		"calendar.txt":              "service_id,start_date,end_date,monday,tuesday,wednesday,thursday,friday,saturday,sunday\n001,20260101,20261231,0,0,0,0,0,0,0\n",
		"trips.txt":                 "service_id,trip_id\n001,trip\n002,other\n",
	})

	// Each case gives the requested filter and the dates expected to survive.
	rangeConfig := &importgtfs.ImportGtfsConfigDateRange{Start: 20260228, End: 20260302}
	for _, test := range []struct {
		name   string
		filter *importgtfs.ImportGtfsConfigTimeRange
		want   []string
	}{
		{"omitted", nil, []string{"20260228", "20260301", "20260302", "20260303"}},
		{"empty", &importgtfs.ImportGtfsConfigTimeRange{}, []string{"20260228", "20260301", "20260302", "20260303"}},
		{"range", &importgtfs.ImportGtfsConfigTimeRange{Date_range: rangeConfig}, []string{"20260228", "20260301", "20260302"}},
		{"discrete", &importgtfs.ImportGtfsConfigTimeRange{Discrete_dates: []int{20260303, 20260228, 20260228}}, []string{"20260228", "20260303"}},
		{"intersection", &importgtfs.ImportGtfsConfigTimeRange{Date_range: rangeConfig, Discrete_dates: []int{20260303, 20260301}}, []string{"20260301"}},
		{"single day", &importgtfs.ImportGtfsConfigTimeRange{Date_range: &importgtfs.ImportGtfsConfigDateRange{Start: 20260301, End: 20260301}}, []string{"20260301"}},
		{"no matches", &importgtfs.ImportGtfsConfigTimeRange{Discrete_dates: []int{20270101}}, []string{}},
	} {
		t.Run(test.name, func(t *testing.T) {
			path, err := importgtfs.ImportGtfsToDatabase(importgtfs.ImportGtfsConfig{
				Source:        localSource(t, archive),
				Sqlite_config: sqlite.SQLiteDatabaseConfig{InstancePath: filepath.Join(t.TempDir(), "dates.db")},
				Time_range:    test.filter,
			})
			requireNoError(t, err)
			database, err := sql.Open("sqlite3", path)
			requireNoError(t, err)
			defer database.Close()
			rows, err := database.Query("SELECT date, exception_type, custom FROM calendar_dates ORDER BY date")
			requireNoError(t, err)
			defer rows.Close()
			got := []string{}
			for rows.Next() {
				var date, exception, custom string
				requireNoError(t, rows.Scan(&date, &exception, &custom))
				got = append(got, date)
				if custom != "keep" || (date == "20260301" && exception != "1") {
					t.Fatal("filter changed raw fields")
				}
			}
			requireNoError(t, rows.Err())
			if !reflect.DeepEqual(got, test.want) {
				t.Fatalf("dates = %v, want %v", got, test.want)
			}

			// Filtering replaces weekly calendars and retains only trips with active service.
			calendarCount, tripCount := 1, 2
			if test.name != "omitted" && test.name != "empty" {
				calendarCount = 0
				services := map[string]bool{}
				for _, date := range got {
					if date <= "20260301" {
						services["001"] = true
					} else {
						services["002"] = true
					}
				}
				tripCount = len(services)
			}
			for table, want := range map[string]int{"calendar": calendarCount, "trips": tripCount} {
				var count int
				requireNoError(t, database.QueryRow("SELECT COUNT(*) FROM "+table).Scan(&count))
				if count != want {
					t.Fatalf("%s changed: %d rows", table, count)
				}
			}
		})
	}
}

// TestImportInvalidTimeRange checks that invalid dates fail before any output is created.
func TestImportInvalidTimeRange(t *testing.T) {
	for _, filter := range []*importgtfs.ImportGtfsConfigTimeRange{
		{Date_range: &importgtfs.ImportGtfsConfigDateRange{Start: 20260302, End: 20260301}},
		{Date_range: &importgtfs.ImportGtfsConfigDateRange{Start: 20260230, End: 20260301}},
		{Date_range: &importgtfs.ImportGtfsConfigDateRange{Start: 20260301}},
		{Discrete_dates: []int{20260229}},
		{Discrete_dates: []int{202603}},
	} {
		outputPath := filepath.Join(t.TempDir(), "invalid.db")
		path, err := importgtfs.ImportGtfsToDatabase(importgtfs.ImportGtfsConfig{
			Source:        localSource(t, makeArchive(t, map[string]string{"calendar_dates.txt": "date\n20260301\n"})),
			Sqlite_config: sqlite.SQLiteDatabaseConfig{InstancePath: outputPath},
			Time_range:    filter,
		})
		if err == nil || path != "" {
			t.Fatalf("invalid time range succeeded: %+v", filter)
		}
		if _, err := os.Stat(outputPath); !os.IsNotExist(err) {
			t.Fatalf("invalid time range created output: %v", err)
		}
	}
}

// TestImportResolvesCalendarAndPrunesDependencies checks weekly schedules, exceptions,
// and removal of unused trips, stop times, routes, shapes, and stops.
func TestImportResolvesCalendarAndPrunesDependencies(t *testing.T) {
	archive := makeArchive(t, map[string]string{
		"calendar.txt":       "service_id,start_date,end_date,monday,tuesday,wednesday,thursday,friday,saturday,sunday\nweekly,20261001,20261130,1,1,0,1,0,0,0\nremoved,20261027,20261027,0,1,0,0,0,0,0\noff,20261001,20261130,0,0,0,0,0,0,1\n",
		"calendar_dates.txt": "service_id,date,exception_type,custom\nweekly,20261027,2,removal\nweekly,20261028,1,addition\nweekly,20261101,1,outside\nremoved,20261027,2,removal\nextra,20261028,1,extra\n",
		"trips.txt":          "trip_id,service_id,route_id,shape_id,custom\nt1,weekly,r1,s1,kept\nt2,removed,r2,s2,removed\nt3,off,r3,s3,removed\nt4,extra,r1,,kept\n",
		"stop_times.txt":     "trip_id,stop_id,stop_sequence\nt1,child,1\nt2,unused,1\nt3,unused,1\nt4,child,1\n",
		"routes.txt":         "route_id\nr1\nr2\nr3\n",
		"shapes.txt":         "shape_id,shape_pt_sequence\ns1,1\ns1,2\ns2,1\ns3,1\n",
		"stops.txt":          "stop_id,parent_station\nchild,parent\nparent,grandparent\ngrandparent,\nunused,\n",
	})

	// Check both disk and memory-export modes against the same connected GTFS tables.
	source := localSource(t, archive)
	for _, memory := range []bool{false, true} {
		t.Run(fmt.Sprintf("memory=%v", memory), func(t *testing.T) {
			path, err := importgtfs.ImportGtfsToDatabase(importgtfs.ImportGtfsConfig{
				Source:        source,
				Sqlite_config: sqlite.SQLiteDatabaseConfig{InstancePath: filepath.Join(t.TempDir(), "filtered.db"), Memory: memory},
				Time_range:    &importgtfs.ImportGtfsConfigTimeRange{Date_range: &importgtfs.ImportGtfsConfigDateRange{Start: 20261026, End: 20261029}},
			})
			requireNoError(t, err)
			if memory {
				t.Cleanup(func() { os.RemoveAll(filepath.Dir(path)) })
			}
			database, err := sql.Open("sqlite3", path)
			requireNoError(t, err)
			defer database.Close()
			dates, err := sqlite.Query[map[string]any](database, "SELECT * FROM calendar_dates ORDER BY service_id,date")
			requireNoError(t, err)

			// Added exceptions keep custom fields; dates generated from weekdays have none.
			expected := []map[string]any{
				{"service_id": "extra", "date": "20261028", "exception_type": "1", "custom": "extra"},
				{"service_id": "weekly", "date": "20261026", "exception_type": "1", "custom": nil},
				{"service_id": "weekly", "date": "20261028", "exception_type": "1", "custom": "addition"},
				{"service_id": "weekly", "date": "20261029", "exception_type": "1", "custom": nil},
			}
			if !reflect.DeepEqual(dates, expected) {
				t.Fatalf("resolved dates = %#v", dates)
			}
			for table, want := range map[string]int{"calendar": 0, "trips": 2, "stop_times": 2, "routes": 1, "shapes": 2, "stops": 3} {
				var count int
				requireNoError(t, database.QueryRow("SELECT COUNT(*) FROM "+table).Scan(&count))
				if count != want {
					t.Fatalf("%s count = %d, want %d", table, count, want)
				}
			}
		})
	}
}

// TestFilteredImportPreservesExistingRowsAndRollsBack checks that filtering affects
// only new data and that a later failed import leaves no rows or temporary tables behind.
func TestFilteredImportPreservesExistingRowsAndRollsBack(t *testing.T) {
	database, err := sql.Open("sqlite3", ":memory:")
	requireNoError(t, err)
	defer database.Close()
	_, err = database.Exec("CREATE TABLE trips(trip_id TEXT,service_id TEXT); INSERT INTO trips VALUES('old','old'); CREATE TABLE calendar_dates(service_id TEXT,date TEXT,exception_type TEXT); INSERT INTO calendar_dates VALUES('old','20200101','1')")
	requireNoError(t, err)
	config := importgtfs.ImportGtfsConfig{
		Source: localSource(t, makeArchive(t, map[string]string{
			"calendar_dates.txt": "service_id,date,exception_type\nnew,20261027,1\nexcluded,20261028,1\n",
			"trips.txt":          "trip_id,service_id\nnew,new\nexcluded,excluded\n",
		})),
		Sqlite_config: sqlite.SQLiteDatabaseConfig{DatabaseInstance: database},
		Time_range:    &importgtfs.ImportGtfsConfigTimeRange{Discrete_dates: []int{20261027}},
	}
	path, err := importgtfs.ImportGtfsToDatabase(config)
	requireNoError(t, err)
	defer os.RemoveAll(filepath.Dir(path))
	for _, table := range []string{"trips", "calendar_dates"} {
		var count int
		requireNoError(t, database.QueryRow("SELECT COUNT(*) FROM "+table).Scan(&count))
		if count != 2 {
			t.Fatalf("%s: existing data changed: %d", table, count)
		}
	}

	// Try another import with an invalid exception and verify the previous data survives.
	config.Source = localSource(t, makeArchive(t, map[string]string{"calendar_dates.txt": "service_id,date,exception_type\nnew,20261027,invalid\n"}))
	if _, err := importgtfs.ImportGtfsToDatabase(config); err == nil {
		t.Fatal("invalid exception succeeded")
	}
	var count int
	requireNoError(t, database.QueryRow("SELECT COUNT(*) FROM calendar_dates").Scan(&count))
	if count != 2 {
		t.Fatal("failed filtered import changed existing data")
	}
	requireNoError(t, database.QueryRow("SELECT COUNT(*) FROM sqlite_temp_master WHERE type='table'").Scan(&count))
	if count != 0 {
		t.Fatalf("staging tables leaked: %d", count)
	}
}

// TestCalendarOnlyDiscreteDates generates active dates without an exception file.
// Repeated dates, inactive weekdays, and dates outside the service period add no rows.
func TestCalendarOnlyDiscreteDates(t *testing.T) {
	path, err := importgtfs.ImportGtfsToDatabase(importgtfs.ImportGtfsConfig{
		Source: localSource(t, makeArchive(t, map[string]string{
			"calendar.txt": "service_id,start_date,end_date,monday,tuesday,wednesday,thursday,friday,saturday,sunday\nweekly,20261001,20261031,1,1,1,1,1,0,0\n",
			"trips.txt":    "service_id,trip_id\nweekly,001\n",
		})),
		Sqlite_config: sqlite.SQLiteDatabaseConfig{InstancePath: filepath.Join(t.TempDir(), "calendar-only.db")},
		Time_range:    &importgtfs.ImportGtfsConfigTimeRange{Discrete_dates: []int{20261027, 20261027, 20261031, 20261102}},
	})
	requireNoError(t, err)
	database, err := sql.Open("sqlite3", path)
	requireNoError(t, err)
	defer database.Close()
	var count int
	var date string
	requireNoError(t, database.QueryRow("SELECT COUNT(*),date FROM calendar_dates").Scan(&count, &date))
	if count != 1 || date != "20261027" {
		t.Fatalf("calendar dates: %d %s", count, date)
	}
}

// TestImportGtfsToMemory checks that the live database needs no output file
// and that a supplied connection remains usable after a failed import.
func TestImportGtfsToMemory(t *testing.T) {
	source := localSource(t, makeArchive(t, map[string]string{"stops.txt": "stop_id,value\n001,\n"}))
	// A nonexistent temporary directory makes accidental database file creation fail.
	t.Setenv("TMPDIR", filepath.Join(t.TempDir(), "missing"))
	database, err := importgtfs.ImportGtfsToMemory(importgtfs.ImportGtfsConfig{Source: source})
	requireNoError(t, err)
	defer database.Cleanup()
	var id string
	var value *string
	requireNoError(t, database.DatabaseInstance.QueryRow("SELECT stop_id, value FROM stops").Scan(&id, &value))
	if id != "001" || value != nil {
		t.Fatalf("unexpected row: %q, %v", id, value)
	}

	// SQLite reports an empty file path when the database really lives in memory.
	var sequence int
	var name, path string
	requireNoError(t, database.DatabaseInstance.QueryRow("PRAGMA database_list").Scan(&sequence, &name, &path))
	if path != "" {
		t.Fatalf("memory database persisted to %s", path)
	}
	// Caller-owned instances stay open on a failed import and retain their data.
	_, err = importgtfs.ImportGtfsToMemory(importgtfs.ImportGtfsConfig{
		Source:        importgtfs.ImportGtfsConfigSource{Path: "missing.zip"},
		Sqlite_config: sqlite.SQLiteDatabaseConfig{DatabaseInstance: database.DatabaseInstance},
	})
	if err == nil {
		t.Fatal("invalid archive succeeded")
	}
	requireNoError(t, database.DatabaseInstance.QueryRow("SELECT stop_id FROM stops").Scan(&id))
}
