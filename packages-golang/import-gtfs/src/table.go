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

// GTFS table names are fixed; their columns are read from each file's header.
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

// Streams CSV rows into a prepared statement without loading the file into memory.
func importTable(transaction *sql.Tx, file *zip.File, tableName string, temporary bool) error {
	stream, err := file.Open()
	if err != nil {
		return err
	}
	defer stream.Close()
	buffer := bufio.NewReader(stream)
	if prefix, _ := buffer.Peek(3); string(prefix) == "\xef\xbb\xbf" {
		buffer.Discard(3)
	}
	reader := csv.NewReader(buffer)
	header, err := reader.Read()
	if errors.Is(err, io.EOF) {
		return nil
	}
	if err != nil {
		return err
	}

	definitions := make([]string, len(header))
	columns := make([]string, len(header))
	placeholders := make([]string, len(header))
	for i, name := range header {
		columns[i] = quoteIdentifier(name)
		definitions[i] = columns[i] + " TEXT"
		placeholders[i] = "?"
	}
	create := "CREATE TABLE IF NOT EXISTS "
	if temporary {
		create = "CREATE TEMP TABLE IF NOT EXISTS "
	}
	if _, err := transaction.Exec(create + quoteIdentifier(tableName) + " (" + strings.Join(definitions, ", ") + ")"); err != nil {
		return err
	}
	statement, err := transaction.Prepare("INSERT INTO " + quoteIdentifier(tableName) + " (" + strings.Join(columns, ", ") + ") VALUES (" + strings.Join(placeholders, ", ") + ")")
	if err != nil {
		return err
	}
	defer statement.Close()
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

func quoteIdentifier(value string) string {
	return `"` + strings.ReplaceAll(value, `"`, `""`) + `"`
}
