package config

// GTFSFileToTable maps GTFS file names (with .txt extension) to their table names (without extension)
var GTFSFileToTable = map[string]string{
	"agency.txt":          "agency",
	"stops.txt":           "stops",
	"routes.txt":          "routes",
	"trips.txt":           "trips",
	"stop_times.txt":      "stop_times",
	"calendar.txt":        "calendar",
	"archives.txt":        "archives",
	"calendar_dates.txt":  "calendar_dates",
	"dates.txt":           "dates",
	"fare_attributes.txt": "fare_attributes",
	"fare_rules.txt":      "fare_rules",
	"feed_info.txt":       "feed_info",
	"municipalities.txt":  "municipalities",
	"periods.txt":         "periods",
	"shapes.txt":          "shapes",
	"frequencies.txt":     "frequencies",
	"levels.txt":          "levels",
	"pathways.txt":        "pathways",
	"transfers.txt":       "transfers",
}

// GTFSFiles is the set of valid GTFS filenames that will be processed
var GTFSFiles = map[string]struct{}{
	"agency.txt":          {},
	"stops.txt":           {},
	"routes.txt":          {},
	"trips.txt":           {},
	"stop_times.txt":      {},
	"calendar.txt":        {},
	"archives.txt":        {},
	"calendar_dates.txt":  {},
	"dates.txt":           {},
	"fare_attributes.txt": {},
	"fare_rules.txt":      {},
	"feed_info.txt":       {},
	"municipalities.txt":  {},
	"periods.txt":         {},
	"shapes.txt":          {},
	"vehicles.txt":        {},
	"frequencies.txt":     {},
	"levels.txt":          {},
	"pathways.txt":        {},
	"transfers.txt":       {},
}

// GTFSTables is the list of all possible GTFS table names (without .txt extension)
// This is used for validation registry and database table checks
var GTFSTables = []string{
	"afetacao", "agency", "archives", "areas", "attributions", "booking_rules",
	"calendar", "calendar_dates", "fare_attributes", "fare_leg_join_rules",
	"fare_leg_rules", "fare_media", "fare_products", "fare_rules",
	"fare_transfer_rules", "feed_info", "frequencies", "levels",
	"location_group_stops", "location_groups", "municipalities", "networks",
	"pathways", "periods", "rider_categories", "route_networks", "routes",
	"shapes", "stop_areas", "stop_times", "stops", "timeframes", "transfers",
	"translations", "trips", "vehicles",
}

// FileToTable converts a GTFS file name (with .txt extension) to its table name
func FileToTable(fileName string) string {
	if table, ok := GTFSFileToTable[fileName]; ok {
		return table
	}
	// Fallback: remove .txt extension
	if len(fileName) > 4 && fileName[len(fileName)-4:] == ".txt" {
		return fileName[:len(fileName)-4]
	}
	return fileName
}

// TableToFile converts a table name (without extension) to its GTFS file name
func TableToFile(tableName string) string {
	for file, table := range GTFSFileToTable {
		if table == tableName {
			return file
		}
	}
	// Fallback: add .txt extension
	return tableName + ".txt"
}
