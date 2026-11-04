package importgtfs

/* * */

import (
	"archive/zip"
	"bufio"
	"database/sql"
	"encoding/csv"
	"errors"
	"io"
	"strings"
)

/* * */

// Recognizes supported GTFS file names, without the .txt extension.
// Columns are read from each file, so custom columns can still be imported.
func isGtfsTable(tableName string) bool {
	switch tableName {
	case "agency", "stops", "routes", "trips", "stop_times", "calendar", "calendar_dates",
		"fare_attributes", "fare_rules", "timeframes", "rider_categories", "fare_media",
		"fare_products", "fare_leg_rules", "fare_leg_join_rules", "fare_transfer_rules",
		"areas", "stop_areas", "networks", "route_networks", "shapes", "frequencies",
		"transfers", "pathways", "levels", "location_groups", "location_group_stops",
		"booking_rules", "translations", "feed_info", "attributions":
		return true
	}
	return false
}

// Reads one CSV file from the ZIP and copies its rows into SQLite.
// Rows are read one at a time to avoid keeping the whole file in memory.
func importTable(transaction *sql.Tx, file *zip.File, tableName string, temporary bool) error {
	// Open the file inside the ZIP and close it on every return path.
	stream, err := file.Open()
	if err != nil {
		return err
	}
	defer stream.Close()

	// Ignore an optional UTF-8 byte order mark, which is not part of the first header.
	buffer := bufio.NewReader(stream)
	if prefix, _ := buffer.Peek(3); string(prefix) == "\xef\xbb\xbf" {
		buffer.Discard(3)
	}

	// The first CSV row names the columns. A completely empty file is skipped.
	reader := csv.NewReader(buffer)
	header, err := reader.Read()
	if errors.Is(err, io.EOF) {
		return nil
	}
	if err != nil {
		return err
	}

	// Keep every column as text, preserving values such as the identifier "001".
	// Question marks reserve places for row values, supplied separately from SQL.
	definitions := make([]string, len(header))
	columns := make([]string, len(header))
	placeholders := make([]string, len(header))
	for i, name := range header {
		columns[i] = quoteIdentifier(name)
		definitions[i] = columns[i] + " TEXT"
		placeholders[i] = "?"
	}

	// Date filtering uses temporary tables so existing output rows stay untouched.
	create := "CREATE TABLE IF NOT EXISTS "
	if temporary {
		create = "CREATE TEMP TABLE IF NOT EXISTS "
	}
	if _, err := transaction.Exec(create + quoteIdentifier(tableName) + " (" + strings.Join(definitions, ", ") + ")"); err != nil {
		return err
	}

	// Prepare the insert once and reuse it for each row.
	statement, err := transaction.Prepare("INSERT INTO " + quoteIdentifier(tableName) + " (" + strings.Join(columns, ", ") + ") VALUES (" + strings.Join(placeholders, ", ") + ")")
	if err != nil {
		return err
	}
	defer statement.Close()

	// Reuse row storage to reduce allocations when importing large files.
	reader.ReuseRecord = true
	values := make([]any, len(header))
	for {
		record, err := reader.Read()
		if errors.Is(err, io.EOF) {
			return nil
		}
		if err != nil {
			return err
		}

		// nil represents a missing value here and is written as SQL NULL.
		// Reset every field so an empty cell cannot reuse the previous row's value.
		for i, value := range record {
			values[i] = nil
			if value != "" {
				values[i] = value
			}
		}
		if _, err := statement.Exec(values...); err != nil {
			return err
		}
	}
}

// Safely quotes SQL table and column names, including embedded quotes.
// Values use question-mark parameters instead; SQL names need this separate escaping.
func quoteIdentifier(value string) string {
	return `"` + strings.ReplaceAll(value, `"`, `""`) + `"`
}
