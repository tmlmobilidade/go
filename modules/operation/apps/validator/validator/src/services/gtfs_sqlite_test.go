package services

import (
	"archive/zip"
	"encoding/csv"
	"main/config"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

func TestImportGTFSUsesCSVHeadersAndPreservesValues(t *testing.T) {
	for _, tc := range []struct {
		name    string
		headers []string
		rows    [][]string
		content string
	}{
		{
			name:    "standard and custom fields",
			headers: []string{"agency_name", "agency_id", "custom_field", "custom-field", "custom field", "select", `"quoted"`, "observações"},
			rows: [][]string{
				{"  Agência A  ", "001", "0", "", "first, second", "text", `He said "hello"`, "linha 1\nlinha 2"},
				{"Agência B", "002", "extra", "other", "  spaces  ", "001.50", "value", "Lisboa"},
			},
		},
		{
			name:    "only fields from the file",
			headers: []string{"custom_id", "custom_value"},
			rows:    [][]string{{"001", "value"}},
		},
		{
			name:    "unquoted whitespace",
			headers: []string{"agency_id", "agency_name", " custom field "},
			rows:    [][]string{{"001", "  Agência A  ", "  value  "}},
			content: "agency_id,agency_name, custom field \n001,  Agência A  ,  value  \n",
		},
		{
			name:    "headers without data",
			headers: []string{"agency_id", "extra_field"},
		},
	} {
		t.Run(tc.name, func(t *testing.T) {
			dir := t.TempDir()
			zipPath := filepath.Join(dir, "feed.zip")
			archive, err := os.Create(zipPath)
			if err != nil {
				t.Fatal(err)
			}
			t.Cleanup(func() { archive.Close() })
			writer := zip.NewWriter(archive)
			entry, err := writer.Create("feed/agency.txt")
			if err != nil {
				t.Fatal(err)
			}
			if _, err := entry.Write([]byte{0xEF, 0xBB, 0xBF}); err != nil {
				t.Fatal(err)
			}
			if tc.content != "" {
				if _, err := entry.Write([]byte(tc.content)); err != nil {
					t.Fatal(err)
				}
			} else {
				csvWriter := csv.NewWriter(entry)
				if err := csvWriter.Write(tc.headers); err != nil {
					t.Fatal(err)
				}
				if err := csvWriter.WriteAll(tc.rows); err != nil {
					t.Fatal(err)
				}
			}
			if err := writer.Close(); err != nil {
				t.Fatal(err)
			}
			if err := archive.Close(); err != nil {
				t.Fatal(err)
			}

			gtfs, err := ImportGTFSZipToSQLite(zipPath, filepath.Join(dir, "feed.db"))
			if err != nil {
				t.Fatal(err)
			}
			t.Cleanup(func() { gtfs.Close() })

			rows, err := gtfs.DB().Query("SELECT * FROM agency ORDER BY rowid")
			if err != nil {
				t.Fatal(err)
			}
			t.Cleanup(func() { rows.Close() })
			columns, err := rows.Columns()
			if err != nil {
				t.Fatal(err)
			}
			if !reflect.DeepEqual(columns, tc.headers) {
				t.Fatalf("columns = %q, want original headers %q", columns, tc.headers)
			}
			var got [][]string
			for rows.Next() {
				row := make([]string, len(columns))
				values := make([]any, len(row))
				for i := range row {
					values[i] = &row[i]
				}
				if err := rows.Scan(values...); err != nil {
					t.Fatal(err)
				}
				got = append(got, row)
			}
			if err := rows.Err(); err != nil {
				t.Fatal(err)
			}
			rows.Close()
			if !reflect.DeepEqual(got, tc.rows) {
				t.Fatalf("rows = %q, want original values %q", got, tc.rows)
			}

			count := 0
			if err := QueryTableRows(gtfs.DB(), "agency", func(index int, row map[string]string) error {
				if index != count || index >= len(tc.rows) {
					t.Fatalf("unexpected row index %d", index)
				}
				assertImportedRow(t, row, tc.headers, tc.rows[index])
				count++
				return nil
			}); err != nil {
				t.Fatal(err)
			}
			if count != len(tc.rows) {
				t.Fatalf("read %d rows, want %d", count, len(tc.rows))
			}
			for index, expected := range tc.rows {
				row, err := GetTableRow(gtfs.DB(), "agency", index)
				if err != nil {
					t.Fatal(err)
				}
				assertImportedRow(t, row, tc.headers, expected)
			}
		})
	}
}

func assertImportedRow(t *testing.T, row map[string]string, headers, values []string) {
	t.Helper()
	want := make(map[string]string, len(headers))
	for i, header := range headers {
		want[header] = values[i]
	}
	if !reflect.DeepEqual(row, want) {
		t.Fatalf("row = %#v, want %#v", row, want)
	}
}

type importTestFile struct {
	name    string
	content string
}

func writeImportTestZIP(t *testing.T, files []importTestFile) string {
	t.Helper()
	zipPath := filepath.Join(t.TempDir(), "feed.zip")
	archive, err := os.Create(zipPath)
	if err != nil {
		t.Fatal(err)
	}
	defer archive.Close()
	writer := zip.NewWriter(archive)
	for _, file := range files {
		entry, err := writer.Create(file.name)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := entry.Write([]byte(file.content)); err != nil {
			t.Fatal(err)
		}
	}
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}
	return zipPath
}

func TestImportGTFSIncludesAllTextTables(t *testing.T) {
	AppMessageService.Clear()
	t.Cleanup(AppMessageService.Clear)
	tables := append([]string{}, config.GTFSTables...)
	tables = append(tables, "dates", "custom-table", "custom_table", "custom table", "select", `custom"table`, "operator's data")
	files := make([]importTestFile, 0, len(tables))
	for _, table := range tables {
		files = append(files, importTestFile{"feed/" + table + ".txt", "custom_value,extra_field\n001,  original value  \n"})
	}
	files = append(files,
		importTestFile{"feed/uppercase.TXT", "custom_value,extra_field\n001,  original value  \n"},
		importTestFile{"feed/header_only.txt", "first,second\n"},
		importTestFile{"feed/._ignored.txt", "not valid CSV"},
		importTestFile{"__MACOSX/feed/metadata.txt", "not valid CSV"},
		importTestFile{"feed/.DS_Store", "metadata"},
		importTestFile{"feed/README.md", "not a CSV file"},
		importTestFile{"feed/locations.geojson", `{"type":"FeatureCollection","features":[]}`},
	)
	tables = append(tables, "uppercase")
	gtfs, err := ReadGTFSZip(writeImportTestZIP(t, files))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		gtfs.Close()
		os.Remove(gtfs.DBPath())
	})
	if errors := AppMessageService.TotalErrors(); errors != 0 {
		t.Fatalf("import errors: %+v", AppMessageService.GetSummary())
	}
	for _, table := range tables {
		if !gtfs.HasTable(table) {
			t.Fatalf("missing table %q", table)
		}
		if count, err := gtfs.GetTableCount(table); err != nil || count != 1 {
			t.Fatalf("%s: count = %d, error = %v", table, count, err)
		}
		row, err := GetTableRow(gtfs.DB(), table, 0)
		if err != nil {
			t.Fatal(err)
		}
		assertImportedRow(t, row, []string{"custom_value", "extra_field"}, []string{"001", "  original value  "})
	}
	if count, err := gtfs.GetTableCount("header_only"); err != nil || count != 0 {
		t.Fatalf("header-only table: count = %d, error = %v", count, err)
	}
	for _, table := range []string{"._ignored", "metadata", ".DS_Store", "README", "locations"} {
		if gtfs.HasTable(table) {
			t.Fatalf("unexpected table %q", table)
		}
	}
	var count int
	if err := gtfs.DB().QueryRow("SELECT COUNT(*) FROM sqlite_master WHERE type = 'table'").Scan(&count); err != nil {
		t.Fatal(err)
	}
	if want := len(tables) + 2; count != want { // header_only and internal id_map
		t.Fatalf("table count = %d, want %d", count, want)
	}
	for _, message := range AppMessageService.GetSummary().Messages {
		if strings.EqualFold(filepath.Ext(message.FileName), ".txt") {
			t.Fatalf("text file was reported as unsupported: %+v", message)
		}
	}
}

func TestImportGTFSRejectsConflictingTables(t *testing.T) {
	for _, name := range []string{"another/agency.txt", "another/AGENCY.txt", "id_map.txt"} {
		t.Run(name, func(t *testing.T) {
			AppMessageService.Clear()
			t.Cleanup(AppMessageService.Clear)
			zipPath := writeImportTestZIP(t, []importTestFile{
				{"agency.txt", "agency_id,agency_name\n001,Original\n"},
				{name, "agency_id,agency_name\n002,Conflicting\n"},
			})
			gtfs, err := ImportGTFSZipToSQLite(zipPath, filepath.Join(t.TempDir(), "feed.db"))
			if err != nil {
				t.Fatal(err)
			}
			t.Cleanup(func() { gtfs.Close() })
			if AppMessageService.TotalErrors() != 1 {
				t.Fatalf("expected one conflict error: %+v", AppMessageService.GetSummary())
			}
			var rows int
			if err := gtfs.DB().QueryRow("SELECT COUNT(*) FROM agency").Scan(&rows); err != nil || rows != 1 {
				t.Fatalf("agency table was changed: rows = %d, error = %v", rows, err)
			}
			idMap, err := LoadIdMapFromSQLite(gtfs.DB())
			if err != nil || !reflect.DeepEqual(idMap["agency"], map[string][]int{"001": {0}}) {
				t.Fatalf("ID map was changed: %+v, error = %v", idMap, err)
			}
		})
	}
}

func TestImportGTFSReportsMalformedCustomCSV(t *testing.T) {
	AppMessageService.Clear()
	t.Cleanup(AppMessageService.Clear)
	zipPath := writeImportTestZIP(t, []importTestFile{{"custom.txt", "one,two\nonly_one\n"}})
	gtfs, err := ImportGTFSZipToSQLite(zipPath, filepath.Join(t.TempDir(), "feed.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { gtfs.Close() })
	if AppMessageService.TotalErrors() != 1 {
		t.Fatalf("malformed CSV was not reported: %+v", AppMessageService.GetSummary())
	}
	if message := AppMessageService.GetSummary().Messages[0]; message.FileName != "custom.txt" {
		t.Fatalf("wrong file reported: %+v", message)
	}
}
