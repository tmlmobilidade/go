package file_validation

import (
	"database/sql"
	"fmt"
	"main/services"
	"main/types"
	"os"
	"reflect"
	"strings"
	"testing"

	dbops "main/services/database"

	_ "modernc.org/sqlite"
)

// createTestGtfs creates a Gtfs struct with a SQLite database containing the specified tables
func createTestGtfs(gtfs types.Gtfs) (*types.Gtfs, func(), error) {
	// Create temporary database
	tmpDB, err := os.CreateTemp("", "test_gtfs_*.db")
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create temp database: %w", err)
	}
	tmpDBPath := tmpDB.Name()
	tmpDB.Close()

	cleanup := func() {
		os.Remove(tmpDBPath)
	}

	// Open database
	db, err := sql.Open("sqlite", tmpDBPath)
	if err != nil {
		cleanup()
		return nil, nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Configure database
	db.Exec("PRAGMA journal_mode=WAL;")
	db.Exec("PRAGMA synchronous=NORMAL;")

	// Map of gtfs tag names to their actual table names (some tags are singular but tables are plural)
	gtfsTagToTableName := map[string]string{
		"agency":              "agency",
		"stop":                "stops",
		"route":               "routes",
		"trip":                "trips",
		"stop_time":           "stop_times",
		"calendar":            "calendar",
		"calendar_dates":      "calendar_dates",
		"fare_attribute":      "fare_attributes",
		"fare_rule":           "fare_rules",
		"shape":               "shapes",
		"frequencies":         "frequencies",
		"transfers":           "transfers",
		"pathways":            "pathways",
		"levels":              "levels",
		"feed_info":           "feed_info",
		"translations":        "translations",
		"attributions":        "attributions",
		"timeframe":           "timeframes",
		"rider_category":      "rider_categories",
		"fare_media":          "fare_media",
		"fare_product":        "fare_products",
		"fare_leg_rule":       "fare_leg_rules",
		"fare_leg_join_rule":  "fare_leg_join_rules",
		"fare_transfer_rule":  "fare_transfer_rules",
		"area":                "areas",
		"stop_area":           "stop_areas",
		"network":             "networks",
		"route_network":       "route_networks",
		"location_group":      "location_groups",
		"location_group_stop": "location_group_stops",
		"booking_rule":        "booking_rules",
		"archive":             "archives",
		"municipality":        "municipalities",
		"afetacao":            "afetacao",
		"period":              "periods",
	}

	// Map of table names to their default headers (minimal headers for testing)
	tableHeaders := map[string][]string{
		"agency":          {"agency_id", "agency_name", "agency_url", "agency_timezone"},
		"routes":          {"route_id", "route_type", "network_id"},
		"trips":           {"trip_id", "route_id"},
		"stop_times":      {"trip_id", "stop_sequence"},
		"stops":           {"stop_id", "stop_name"},
		"calendar":        {"service_id"},
		"calendar_dates":  {"service_id", "date", "exception_type"},
		"pathways":        {"pathway_id", "from_stop_id", "to_stop_id", "pathway_mode"},
		"levels":          {"level_id", "level_index", "level_name"},
		"feed_info":       {"feed_publisher_name", "feed_publisher_url", "feed_lang"},
		"translations":    {"table_name", "field_name", "language", "translation"},
		"networks":        {"network_id", "network_name"},
		"route_networks":  {"route_id", "network_id"},
		"shapes":          {"shape_id", "shape_pt_lat", "shape_pt_lon", "shape_pt_sequence"},
		"fare_attributes": {"fare_id", "price", "currency_type", "payment_method"},
		"locations":       {"location_id", "location_name"},
		"location_groups": {"location_group_id", "location_group_name"},
	}

	// Create tables based on non-empty fields in gtfs struct
	v := reflect.ValueOf(gtfs)
	tp := reflect.TypeOf(gtfs)

	for i := 0; i < v.NumField(); i++ {
		field := v.Field(i)
		fieldType := tp.Field(i)

		// Skip non-slice fields and private fields
		if field.Kind() != reflect.Slice || !field.CanInterface() {
			continue
		}

		// Check if field has data
		if field.Len() == 0 {
			continue
		}

		// Get table name from gtfs tag
		gtfsTag := fieldType.Tag.Get("gtfs")
		if gtfsTag == "" || gtfsTag == "-" {
			continue
		}

		// Map gtfs tag to actual table name
		tableName, ok := gtfsTagToTableName[gtfsTag]
		if !ok {
			// If no mapping found, use the tag as-is
			tableName = gtfsTag
		}

		// Get headers for this table
		headers, ok := tableHeaders[tableName]
		if !ok {
			// Default headers if not found
			headers = []string{"id"}
		}

		// Create table
		if err := dbops.CreateTableIfNotExists(db, tableName, headers); err != nil {
			db.Close()
			cleanup()
			return nil, nil, fmt.Errorf("failed to create table %s: %w", tableName, err)
		}

		// Insert data from struct slice into table
		if err := insertStructSliceData(db, tableName, headers, field); err != nil {
			db.Close()
			cleanup()
			return nil, nil, fmt.Errorf("failed to insert data into table %s: %w", tableName, err)
		}
	}

	// Create Gtfs struct with database
	result := types.NewGtfsFromSQLite(db, tmpDBPath)
	result.IdMap = make(map[string]map[string][]int)

	return result, cleanup, nil
}

// insertStructSliceData inserts data from a struct slice into a database table
func insertStructSliceData(db *sql.DB, tableName string, headers []string, sliceValue reflect.Value) error {
	if sliceValue.Len() == 0 {
		return nil
	}

	// Build INSERT statement with sanitized column names
	sanitizedHeaders := make([]string, len(headers))
	for i, h := range headers {
		sanitizedHeaders[i] = dbops.SanitizeColumnName(h)
	}
	placeholders := "(" + strings.Repeat("?,", len(headers)-1) + "?)"
	insertSQL := fmt.Sprintf("INSERT INTO %s (%s) VALUES %s", dbops.SanitizeTableName(tableName), strings.Join(sanitizedHeaders, ","), placeholders)

	stmt, err := db.Prepare(insertSQL)
	if err != nil {
		return fmt.Errorf("failed to prepare insert statement: %w", err)
	}
	defer stmt.Close()

	// Insert each struct in the slice
	for i := 0; i < sliceValue.Len(); i++ {
		structValue := sliceValue.Index(i)
		structType := structValue.Type()

		// Convert struct to map[string]string using gtfs tags
		rowMap := make(map[string]string)
		for j := 0; j < structValue.NumField(); j++ {
			field := structValue.Field(j)
			fieldType := structType.Field(j)
			gtfsTag := fieldType.Tag.Get("gtfs")
			if gtfsTag != "" && gtfsTag != "-" {
				rowMap[gtfsTag] = fmt.Sprintf("%v", field.Interface())
			}
		}

		// Build values array matching headers order
		values := make([]interface{}, len(headers))
		for j, header := range headers {
			if val, ok := rowMap[header]; ok {
				values[j] = val
			} else {
				values[j] = ""
			}
		}

		// Insert row
		if _, err := stmt.Exec(values...); err != nil {
			return fmt.Errorf("failed to insert row: %w", err)
		}
	}

	return nil
}

func TestFileValidation(t *testing.T) {
	tests := []struct {
		name                 string
		gtfs                 types.Gtfs
		rules                *types.GtfsRules
		wantErrors           int
		wantWarnings         int
		checkMessages        func([]types.Message) bool
		createLocationsTable bool // For testing locations.geojson scenario
	}{
		{
			name: "all required files present",
			gtfs: types.Gtfs{
				Agency:   []types.AgencyRaw{{AgencyId: "1"}},
				Route:    []types.RouteRaw{{RouteId: "1", RouteType: "1"}},
				Trip:     []types.TripRaw{{TripId: "1", RouteId: "1"}},
				StopTime: []types.StopTimeRaw{{TripId: "1", StopSequence: "1"}},
				Stop:     []types.StopRaw{{StopId: "1", StopName: "1"}},
				Calendar: []types.CalendarRaw{{ServiceId: "1"}},
			},
			rules:        nil,
			wantErrors:   0,
			wantWarnings: 0,
		},
		{
			name: "missing required files",
			gtfs: types.Gtfs{
				Route: []types.RouteRaw{{RouteId: "1", RouteType: "1"}},
				// Missing Agency, Trip, StopTime
				Stop:     []types.StopRaw{{StopId: "1", StopName: "1"}},
				Calendar: []types.CalendarRaw{{ServiceId: "1"}},
			},
			rules:        nil,
			wantErrors:   3, // missing agency.txt, trips.txt, stop_times.txt
			wantWarnings: 0,
			checkMessages: func(messages []types.Message) bool {
				requiredFiles := map[string]bool{
					"agency.txt":     false,
					"trips.txt":      false,
					"stop_times.txt": false,
				}

				for _, msg := range messages {
					if _, ok := requiredFiles[msg.FileName]; ok {
						requiredFiles[msg.FileName] = true
					}
				}

				for _, found := range requiredFiles {
					if !found {
						return false
					}
				}
				return true
			},
		},
		{
			name: "missing stops.txt without locations.geojson",
			gtfs: types.Gtfs{
				Agency:   []types.AgencyRaw{{AgencyId: "1"}},
				Route:    []types.RouteRaw{{RouteId: "1", RouteType: "1"}},
				Trip:     []types.TripRaw{{TripId: "1", RouteId: "1"}},
				StopTime: []types.StopTimeRaw{{TripId: "1", StopSequence: "1"}},
				// No Stop or Location
				Calendar: []types.CalendarRaw{{ServiceId: "1"}},
			},
			rules:        nil,
			wantErrors:   1,
			wantWarnings: 0,
			checkMessages: func(messages []types.Message) bool {
				for _, msg := range messages {
					if msg.FileName == "stops.txt" {
						return true
					}
				}
				return false
			},
		},
		{
			name: "missing stops.txt with locations.geojson is valid",
			gtfs: types.Gtfs{
				Agency:   []types.AgencyRaw{{AgencyId: "1"}},
				Route:    []types.RouteRaw{{RouteId: "1", RouteType: "1"}},
				Trip:     []types.TripRaw{{TripId: "1", RouteId: "1"}},
				StopTime: []types.StopTimeRaw{{TripId: "1", StopSequence: "1"}},
				Calendar: []types.CalendarRaw{{ServiceId: "1"}},
			},
			rules:                nil,
			wantErrors:           0,
			wantWarnings:         0,
			createLocationsTable: true, // Create locations table to simulate locations.geojson
		},
		{
			name: "missing both calendar.txt and calendar_dates.txt",
			gtfs: types.Gtfs{
				Agency:   []types.AgencyRaw{{AgencyId: "1"}},
				Route:    []types.RouteRaw{{RouteId: "1", RouteType: "1"}},
				Trip:     []types.TripRaw{{TripId: "1", RouteId: "1"}},
				StopTime: []types.StopTimeRaw{{TripId: "1", StopSequence: "1"}},
				Stop:     []types.StopRaw{{StopId: "1", StopName: "1"}},
				// No Calendar or CalendarDates
			},
			rules:        nil,
			wantErrors:   1, // One for either required
			wantWarnings: 0,
			checkMessages: func(messages []types.Message) bool {
				for _, msg := range messages {
					if msg.FileName == "calendar.txt" {
						return true
					}
				}

				return false
			},
		},
		{
			name: "levels.txt required with elevator pathways",
			gtfs: types.Gtfs{
				Agency:   []types.AgencyRaw{{AgencyId: "1"}},
				Route:    []types.RouteRaw{{RouteId: "1", RouteType: "1"}},
				Trip:     []types.TripRaw{{TripId: "1", RouteId: "1"}},
				StopTime: []types.StopTimeRaw{{TripId: "1", StopSequence: "1"}},
				Stop:     []types.StopRaw{{StopId: "1", StopName: "1"}},
				Calendar: []types.CalendarRaw{{ServiceId: "1"}},
				Pathways: []types.PathwaysRaw{{PathwayMode: "5"}}, // elevator
			},
			rules:        nil,
			wantErrors:   1,
			wantWarnings: 0,
			checkMessages: func(messages []types.Message) bool {
				for _, msg := range messages {
					if msg.FileName == "levels.txt" {
						return true
					}
				}
				return false
			},
		},
		{
			name: "feed_info.txt required with translations.txt",
			gtfs: types.Gtfs{
				Agency:       []types.AgencyRaw{{AgencyId: "1"}},
				Route:        []types.RouteRaw{{RouteId: "1", RouteType: "1"}},
				Trip:         []types.TripRaw{{TripId: "1", RouteId: "1"}},
				StopTime:     []types.StopTimeRaw{{TripId: "1", StopSequence: "1"}},
				Stop:         []types.StopRaw{{StopId: "1", StopName: "1"}},
				Calendar:     []types.CalendarRaw{{ServiceId: "1"}},
				Translations: []types.TranslationsRaw{{Translation: "1"}},
			},
			rules:        nil,
			wantErrors:   1,
			wantWarnings: 0,
			checkMessages: func(messages []types.Message) bool {
				for _, msg := range messages {
					if msg.FileName == "feed_info.txt" {
						return true
					}
				}
				return false
			},
		},
		{
			name: "networks.txt forbidden with network_id in routes",
			gtfs: types.Gtfs{
				Agency:   []types.AgencyRaw{{AgencyId: "1"}},
				Route:    []types.RouteRaw{{RouteId: "1", RouteType: "1", NetworkId: "net1"}},
				Trip:     []types.TripRaw{{TripId: "1", RouteId: "1"}},
				StopTime: []types.StopTimeRaw{{TripId: "1", StopSequence: "1"}},
				Stop:     []types.StopRaw{{StopId: "1", StopName: "1"}},
				Calendar: []types.CalendarRaw{{ServiceId: "1"}},
				Network:  []types.NetworkRaw{{NetworkId: "1"}}, // networks.txt exists, should be forbidden
			},
			rules:        nil,
			wantErrors:   1,
			wantWarnings: 0,
			checkMessages: func(messages []types.Message) bool {
				for _, msg := range messages {
					if msg.FileName == "networks.txt" {
						return true
					}
				}
				return false
			},
		},
		{
			name: "route_networks.txt forbidden with network_id in routes",
			gtfs: types.Gtfs{
				Agency:       []types.AgencyRaw{{AgencyId: "1"}},
				Route:        []types.RouteRaw{{RouteId: "1", RouteType: "1", NetworkId: "net1"}},
				Trip:         []types.TripRaw{{TripId: "1", RouteId: "1"}},
				StopTime:     []types.StopTimeRaw{{TripId: "1", StopSequence: "1"}},
				Stop:         []types.StopRaw{{StopId: "1", StopName: "1"}},
				Calendar:     []types.CalendarRaw{{ServiceId: "1"}},
				RouteNetwork: []types.RouteNetworkRaw{{NetworkId: "1"}},
			},
			rules:        nil,
			wantErrors:   1,
			wantWarnings: 0,
			checkMessages: func(messages []types.Message) bool {
				for _, msg := range messages {
					if msg.FileName == "route_networks.txt" {
						return true
					}
				}
				return false
			},
		},
		{
			name: "required file from rules - feed_info.txt marked as required",
			gtfs: types.Gtfs{
				Agency:   []types.AgencyRaw{{AgencyId: "1"}},
				Route:    []types.RouteRaw{{RouteId: "1", RouteType: "1"}},
				Trip:     []types.TripRaw{{TripId: "1", RouteId: "1"}},
				StopTime: []types.StopTimeRaw{{TripId: "1", StopSequence: "1"}},
				Stop:     []types.StopRaw{{StopId: "1", StopName: "1"}},
				Calendar: []types.CalendarRaw{{ServiceId: "1"}},
			},
			rules: &types.GtfsRules{
				FeedInfo: types.FeedInfoRules{
					File: types.SEVERITY_ERROR, // Mark feed_info.txt as required
				},
			},
			wantErrors:   1,
			wantWarnings: 0,
			checkMessages: func(messages []types.Message) bool {
				for _, msg := range messages {
					if msg.FileName == "feed_info.txt" {
						return true
					}
				}
				return false
			},
		},
		{
			name: "required file from rules - shapes.txt marked as required",
			gtfs: types.Gtfs{
				Agency:   []types.AgencyRaw{{AgencyId: "1"}},
				Route:    []types.RouteRaw{{RouteId: "1", RouteType: "1"}},
				Trip:     []types.TripRaw{{TripId: "1", RouteId: "1"}},
				StopTime: []types.StopTimeRaw{{TripId: "1", StopSequence: "1"}},
				Stop:     []types.StopRaw{{StopId: "1", StopName: "1"}},
				Calendar: []types.CalendarRaw{{ServiceId: "1"}},
			},
			rules: &types.GtfsRules{
				Shapes: types.ShapesRules{
					File: types.SEVERITY_ERROR, // Mark shapes.txt as required
				},
			},
			wantErrors:   1,
			wantWarnings: 0,
			checkMessages: func(messages []types.Message) bool {
				for _, msg := range messages {
					if msg.FileName == "shapes.txt" {
						return true
					}
				}
				return false
			},
		},
		{
			name: "required file from rules - multiple files marked as required",
			gtfs: types.Gtfs{
				Agency:   []types.AgencyRaw{{AgencyId: "1"}},
				Route:    []types.RouteRaw{{RouteId: "1", RouteType: "1"}},
				Trip:     []types.TripRaw{{TripId: "1", RouteId: "1"}},
				StopTime: []types.StopTimeRaw{{TripId: "1", StopSequence: "1"}},
				Stop:     []types.StopRaw{{StopId: "1", StopName: "1"}},
				Calendar: []types.CalendarRaw{{ServiceId: "1"}},
			},
			rules: &types.GtfsRules{
				FeedInfo: types.FeedInfoRules{
					File: types.SEVERITY_ERROR,
				},
				Shapes: types.ShapesRules{
					File: types.SEVERITY_ERROR,
				},
				FareAttributes: types.FareAttributesRules{
					File: types.SEVERITY_ERROR,
				},
			},
			wantErrors:   3,
			wantWarnings: 0,
			checkMessages: func(messages []types.Message) bool {
				requiredFiles := map[string]bool{
					"feed_info.txt":       false,
					"shapes.txt":          false,
					"fare_attributes.txt": false,
				}

				for _, msg := range messages {
					if _, ok := requiredFiles[msg.FileName]; ok {
						requiredFiles[msg.FileName] = true
					}
				}

				for _, found := range requiredFiles {
					if !found {
						return false
					}
				}
				return true
			},
		},
		{
			name: "required file from rules - file present should not error",
			gtfs: types.Gtfs{
				Agency:   []types.AgencyRaw{{AgencyId: "1"}},
				Route:    []types.RouteRaw{{RouteId: "1", RouteType: "1"}},
				Trip:     []types.TripRaw{{TripId: "1", RouteId: "1"}},
				StopTime: []types.StopTimeRaw{{TripId: "1", StopSequence: "1"}},
				Stop:     []types.StopRaw{{StopId: "1", StopName: "1"}},
				Calendar: []types.CalendarRaw{{ServiceId: "1"}},
				FeedInfo: []types.FeedInfoRaw{{FeedPublisherName: "Test"}},
			},
			rules: &types.GtfsRules{
				FeedInfo: types.FeedInfoRules{
					File: types.SEVERITY_ERROR, // Mark feed_info.txt as required
				},
			},
			wantErrors:   0,
			wantWarnings: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Clear message service before each test
			services.AppMessageService.Clear()

			// Create test GTFS with database
			testGtfs, cleanup, err := createTestGtfs(tt.gtfs)
			if err != nil {
				t.Fatalf("Failed to create test GTFS: %v", err)
			}
			defer cleanup()
			defer testGtfs.Close()

			// Create locations table if needed (for testing locations.geojson scenario)
			if tt.createLocationsTable {
				headers := []string{"location_id", "location_name"}
				if err := dbops.CreateTableIfNotExists(testGtfs.DB(), "locations", headers); err != nil {
					t.Fatalf("Failed to create locations table: %v", err)
				}
			}

			v := NewFileValidation()
			hasErrors := v.Validate(*testGtfs, tt.rules)

			summary := services.AppMessageService.GetSummary()
			if summary.TotalErrors != tt.wantErrors {
				t.Errorf("[%v] FileValidation.Validate() got %v errors, want %v", tt.name, summary.TotalErrors, tt.wantErrors)
				for _, msg := range summary.Messages {
					fmt.Println(msg)
				}
			}

			if summary.TotalWarnings != tt.wantWarnings {
				t.Errorf("[%v] FileValidation.Validate() got %v warnings, want %v", tt.name, summary.TotalWarnings, tt.wantWarnings)
			}

			// Check hasErrors return value
			expectedHasErrors := tt.wantErrors > 0
			if hasErrors != expectedHasErrors {
				t.Errorf("[%v] FileValidation.Validate() hasErrors = %v, want %v", tt.name, hasErrors, expectedHasErrors)
			}

			for _, msg := range summary.Messages {
				if msg.RuleID != types.RuleIDGtfsFeedFilePresenceAndIntegrity {
					t.Errorf("[%v] FileValidation.Validate() got message with rule_id %v, want %v", tt.name, msg.RuleID, types.RuleIDGtfsFeedFilePresenceAndIntegrity)
				}
			}

			if tt.checkMessages != nil && !tt.checkMessages(summary.Messages) {
				t.Errorf("[%v] FileValidation.Validate() messages did not match expected conditions", tt.name)
			}
		})
	}
}

func TestCheckWarningFiles(t *testing.T) {
	tests := []struct {
		name          string
		gtfs          types.Gtfs
		rules         *types.GtfsRules
		wantWarnings  int
		checkMessages func([]types.Message) bool
	}{
		{
			name: "warning file from rules - feed_info.txt marked as warning and missing",
			gtfs: types.Gtfs{
				Agency:   []types.AgencyRaw{{AgencyId: "1"}},
				Route:    []types.RouteRaw{{RouteId: "1", RouteType: "1"}},
				Trip:     []types.TripRaw{{TripId: "1", RouteId: "1"}},
				StopTime: []types.StopTimeRaw{{TripId: "1", StopSequence: "1"}},
				Stop:     []types.StopRaw{{StopId: "1", StopName: "1"}},
				Calendar: []types.CalendarRaw{{ServiceId: "1"}},
				// FeedInfo is missing
			},
			rules: &types.GtfsRules{
				FeedInfo: types.FeedInfoRules{
					File: types.SEVERITY_WARNING, // Mark feed_info.txt as warning
				},
			},
			wantWarnings: 1,
			checkMessages: func(messages []types.Message) bool {
				for _, msg := range messages {
					if msg.FileName == "feed_info.txt" && msg.Severity == types.SEVERITY_WARNING {
						return true
					}
				}
				return false
			},
		},
		{
			name: "warning file from rules - shapes.txt marked as warning and missing",
			gtfs: types.Gtfs{
				Agency:   []types.AgencyRaw{{AgencyId: "1"}},
				Route:    []types.RouteRaw{{RouteId: "1", RouteType: "1"}},
				Trip:     []types.TripRaw{{TripId: "1", RouteId: "1"}},
				StopTime: []types.StopTimeRaw{{TripId: "1", StopSequence: "1"}},
				Stop:     []types.StopRaw{{StopId: "1", StopName: "1"}},
				Calendar: []types.CalendarRaw{{ServiceId: "1"}},
				// Shapes is missing
			},
			rules: &types.GtfsRules{
				Shapes: types.ShapesRules{
					File: types.SEVERITY_WARNING, // Mark shapes.txt as warning
				},
			},
			wantWarnings: 1,
			checkMessages: func(messages []types.Message) bool {
				for _, msg := range messages {
					if msg.FileName == "shapes.txt" && msg.Severity == types.SEVERITY_WARNING {
						return true
					}
				}
				return false
			},
		},
		{
			name: "warning file from rules - file present should not warn",
			gtfs: types.Gtfs{
				Agency:   []types.AgencyRaw{{AgencyId: "1"}},
				Route:    []types.RouteRaw{{RouteId: "1", RouteType: "1"}},
				Trip:     []types.TripRaw{{TripId: "1", RouteId: "1"}},
				StopTime: []types.StopTimeRaw{{TripId: "1", StopSequence: "1"}},
				Stop:     []types.StopRaw{{StopId: "1", StopName: "1"}},
				Calendar: []types.CalendarRaw{{ServiceId: "1"}},
				FeedInfo: []types.FeedInfoRaw{{FeedPublisherName: "Test"}},
			},
			rules: &types.GtfsRules{
				FeedInfo: types.FeedInfoRules{
					File: types.SEVERITY_WARNING, // Mark feed_info.txt as warning
				},
			},
			wantWarnings: 0,
		},
		{
			name: "warning file from rules - multiple files marked as warning",
			gtfs: types.Gtfs{
				Agency:   []types.AgencyRaw{{AgencyId: "1"}},
				Route:    []types.RouteRaw{{RouteId: "1", RouteType: "1"}},
				Trip:     []types.TripRaw{{TripId: "1", RouteId: "1"}},
				StopTime: []types.StopTimeRaw{{TripId: "1", StopSequence: "1"}},
				Stop:     []types.StopRaw{{StopId: "1", StopName: "1"}},
				Calendar: []types.CalendarRaw{{ServiceId: "1"}},
				// FeedInfo, Shapes, and FareAttributes are missing
			},
			rules: &types.GtfsRules{
				FeedInfo: types.FeedInfoRules{
					File: types.SEVERITY_WARNING,
				},
				Shapes: types.ShapesRules{
					File: types.SEVERITY_WARNING,
				},
				FareAttributes: types.FareAttributesRules{
					File: types.SEVERITY_WARNING,
				},
			},
			wantWarnings: 3,
			checkMessages: func(messages []types.Message) bool {
				warningFiles := map[string]bool{
					"feed_info.txt":       false,
					"shapes.txt":          false,
					"fare_attributes.txt": false,
				}

				for _, msg := range messages {
					if msg.Severity == types.SEVERITY_WARNING {
						if _, ok := warningFiles[msg.FileName]; ok {
							warningFiles[msg.FileName] = true
						}
					}
				}

				for _, found := range warningFiles {
					if !found {
						return false
					}
				}
				return true
			},
		},
		{
			name: "warning file from rules - no warning files marked",
			gtfs: types.Gtfs{
				Agency:   []types.AgencyRaw{{AgencyId: "1"}},
				Route:    []types.RouteRaw{{RouteId: "1", RouteType: "1"}},
				Trip:     []types.TripRaw{{TripId: "1", RouteId: "1"}},
				StopTime: []types.StopTimeRaw{{TripId: "1", StopSequence: "1"}},
				Stop:     []types.StopRaw{{StopId: "1", StopName: "1"}},
				Calendar: []types.CalendarRaw{{ServiceId: "1"}},
			},
			rules:        nil,
			wantWarnings: 0,
		},
		{
			name: "warning file from rules - mix of warning and error severity",
			gtfs: types.Gtfs{
				Agency:   []types.AgencyRaw{{AgencyId: "1"}},
				Route:    []types.RouteRaw{{RouteId: "1", RouteType: "1"}},
				Trip:     []types.TripRaw{{TripId: "1", RouteId: "1"}},
				StopTime: []types.StopTimeRaw{{TripId: "1", StopSequence: "1"}},
				Stop:     []types.StopRaw{{StopId: "1", StopName: "1"}},
				Calendar: []types.CalendarRaw{{ServiceId: "1"}},
				// FeedInfo and Shapes are missing
			},
			rules: &types.GtfsRules{
				FeedInfo: types.FeedInfoRules{
					File: types.SEVERITY_WARNING, // Warning severity
				},
				Shapes: types.ShapesRules{
					File: types.SEVERITY_ERROR, // Error severity (should not appear in warning messages)
				},
			},
			wantWarnings: 1, // Only feed_info.txt should generate warning
			checkMessages: func(messages []types.Message) bool {
				warningCount := 0
				for _, msg := range messages {
					if msg.Severity == types.SEVERITY_WARNING {
						warningCount++
						if msg.FileName != "feed_info.txt" {
							return false
						}
					}
				}
				return warningCount == 1
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Clear message service before each test
			services.AppMessageService.Clear()

			// Create test GTFS with database
			testGtfs, cleanup, err := createTestGtfs(tt.gtfs)
			if err != nil {
				t.Fatalf("Failed to create test GTFS: %v", err)
			}
			defer cleanup()
			defer testGtfs.Close()

			v := NewFileValidation()
			v.checkWarningFiles(*testGtfs, tt.rules)

			summary := services.AppMessageService.GetSummary()
			if summary.TotalWarnings != tt.wantWarnings {
				t.Errorf("[%v] FileValidation.checkWarningFiles() got %v warnings, want %v", tt.name, summary.TotalWarnings, tt.wantWarnings)
				for _, msg := range summary.Messages {
					fmt.Println(msg)
				}
			}

			for _, msg := range summary.Messages {
				if msg.Severity != types.SEVERITY_WARNING {
					t.Errorf("[%v] FileValidation.checkWarningFiles() got message with severity %v, want %v", tt.name, msg.Severity, types.SEVERITY_WARNING)
				}
				if msg.RuleID != types.RuleIDGtfsFeedFilePresenceAndIntegrity {
					t.Errorf("[%v] FileValidation.checkWarningFiles() got message with rule_id %v, want %v", tt.name, msg.RuleID, types.RuleIDGtfsFeedFilePresenceAndIntegrity)
				}
			}

			if tt.checkMessages != nil && !tt.checkMessages(summary.Messages) {
				t.Errorf("[%v] FileValidation.checkWarningFiles() messages did not match expected conditions", tt.name)
			}
		})
	}
}
