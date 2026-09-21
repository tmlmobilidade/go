package types

import (
	"database/sql"
	"fmt"
	"reflect"
	"strconv"
	"strings"
)

/* AGENCY */
type AgencyRaw struct {
	AgencyEmail    string `gtfs:"agency_email"`
	AgencyFareUrl  string `gtfs:"agency_fare_url"`
	AgencyId       string `gtfs:"agency_id"`
	AgencyLang     string `gtfs:"agency_lang"`
	AgencyName     string `gtfs:"agency_name"`
	AgencyPhone    string `gtfs:"agency_phone"`
	AgencyTimezone string `gtfs:"agency_timezone"`
	AgencyUrl      string `gtfs:"agency_url"`
}

/* STOP */
type StopRaw struct {
	HasBench              string `gtfs:"has_bench"`
	HasNetworkMap         string `gtfs:"has_network_map"`
	HasPipRealTime        string `gtfs:"has_pip_real_time"`
	HasSchedules          string `gtfs:"has_schedules"`
	HasShelter            string `gtfs:"has_shelter"`
	HasStopSign           string `gtfs:"has_stop_sign"`
	HasTariffsInformation string `gtfs:"has_tariffs_information"`
	LevelId               string `gtfs:"level_id"`
	LocationType          string `gtfs:"location_type"`
	MunicipalityId        string `gtfs:"municipality_id"`
	ParentStation         string `gtfs:"parent_station"`
	ParishId              string `gtfs:"parish_id"`
	PlatformCode          string `gtfs:"platform_code"`
	PublicVisible         string `gtfs:"public_visible"`
	RegionId              string `gtfs:"region_id"`
	ShelterCode           string `gtfs:"shelter_code"`
	ShelterMaintainer     string `gtfs:"shelter_maintainer"`
	StopCode              string `gtfs:"stop_code"`
	StopDesc              string `gtfs:"stop_desc"`
	StopId                string `gtfs:"stop_id"`
	StopLat               string `gtfs:"stop_lat"`
	StopLon               string `gtfs:"stop_lon"`
	StopName              string `gtfs:"stop_name"`
	StopShortName         string `gtfs:"stop_short_name"`
	StopTimezone          string `gtfs:"stop_timezone"`
	StopUrl               string `gtfs:"stop_url"`
	TtsStopName           string `gtfs:"tts_stop_name"`
	WheelchairBoarding    string `gtfs:"wheelchair_boarding"`
	ZoneId                string `gtfs:"zone_id"`
	StopAccess            string `gtfs:"stop_access"`
}

/* ROUTE */
type RouteRaw struct {
	// Required fields
	RouteId   string `gtfs:"route_id"`
	RouteType string `gtfs:"route_type"`
	// LineId    string `gtfs:"line_id"`

	// Optional fields
	AgencyId          string `gtfs:"agency_id"`
	ContinuousDropOff string `gtfs:"continuous_drop_off"`
	ContinuousPickup  string `gtfs:"continuous_pickup"`
	// LineShortName     string `gtfs:"line_short_name"`
	// LineLongName      string `gtfs:"line_long_name"`
	RouteColor        string `gtfs:"route_color"`
	RouteDesc         string `gtfs:"route_desc"`
	RouteLongName     string `gtfs:"route_long_name"`
	RouteShortName    string `gtfs:"route_short_name"`
	RouteSortOrder    string `gtfs:"route_sort_order"`
	RouteTextColor    string `gtfs:"route_text_color"`
	RouteUrl          string `gtfs:"route_url"`
	NetworkId         string `gtfs:"network_id"`
	PathType          string `gtfs:"path_type"`
}

/* TRIP */

type TripRaw struct {
	BikesAllowed         string `gtfs:"bikes_allowed"`
	BlockId              string `gtfs:"block_id"`
	CalendarDesc         string `gtfs:"calendar_desc"`
	DirectionId          string `gtfs:"direction_id"`
	PatternId            string `gtfs:"pattern_id"`
	RouteId              string `gtfs:"route_id"`
	ServiceId            string `gtfs:"service_id"`
	ShapeId              string `gtfs:"shape_id"`
	TripHeadsign         string `gtfs:"trip_headsign"`
	TripId               string `gtfs:"trip_id"`
	TripShortName        string `gtfs:"trip_short_name"`
	WheelchairAccessible string `gtfs:"wheelchair_accessible"`
}

/* STOP TIME */
type StopTimeRaw struct {
	TripId                   string `gtfs:"trip_id"`
	ArrivalTime              string `gtfs:"arrival_time"`
	DepartureTime            string `gtfs:"departure_time"`
	StopId                   string `gtfs:"stop_id"`
	LocationGroupId          string `gtfs:"location_group_id"`
	LocationId               string `gtfs:"location_id"`
	StopSequence             string `gtfs:"stop_sequence"`
	StopHeadsign             string `gtfs:"stop_headsign"`
	StartPickupDropOffWindow string `gtfs:"start_pickup_drop_off_window"`
	EndPickupDropOffWindow   string `gtfs:"end_pickup_drop_off_window"`
	PickupType               string `gtfs:"pickup_type"`
	DropOffType              string `gtfs:"drop_off_type"`
	ContinuousPickup         string `gtfs:"continuous_pickup"`
	ContinuousDropOff        string `gtfs:"continuous_drop_off"`
	ShapeDistTraveled        string `gtfs:"shape_dist_traveled"`
	Timepoint                string `gtfs:"timepoint"`
	PickupBookingRuleId      string `gtfs:"pickup_booking_rule_id"`
	DropOffBookingRuleId     string `gtfs:"drop_off_booking_rule_id"`
}

/* CALENDAR */
type CalendarRaw struct {
	EndDate   string `gtfs:"end_date"`
	Friday    string `gtfs:"friday"`
	Monday    string `gtfs:"monday"`
	Saturday  string `gtfs:"saturday"`
	ServiceId string `gtfs:"service_id"`
	StartDate string `gtfs:"start_date"`
	Sunday    string `gtfs:"sunday"`
	Thursday  string `gtfs:"thursday"`
	Tuesday   string `gtfs:"tuesday"`
	Wednesday string `gtfs:"wednesday"`
}

/* CALENDAR DATES */
type CalendarDatesRaw struct {
	Date          string `gtfs:"date"`
	ExceptionType string `gtfs:"exception_type"`
	ServiceId     string `gtfs:"service_id"`
}

/* FARE ATTRIBUTES */
type FareAttributeRaw struct {
	FareId           string `gtfs:"fare_id"`           // Identifies a fare class
	Price            string `gtfs:"price"`             // Fare price, in the unit specified by currency_type
	CurrencyType     string `gtfs:"currency_type"`     // Currency used to pay the fare
	PaymentMethod    string `gtfs:"payment_method"`    // When the fare must be paid (0: on board, 1: before boarding)
	Transfers        string `gtfs:"transfers"`         // Number of transfers permitted (0: none, 1: once, 2: twice, empty: unlimited)
	AgencyId         string `gtfs:"agency_id"`         // Agency associated with the fare (required if multiple agencies)
	TransferDuration string `gtfs:"transfer_duration"` // Length of time in seconds before a transfer expires
}

/* FARE RULES */
type FareRuleRaw struct {
	FareId        string `gtfs:"fare_id"`        // Identifies a fare class
	RouteId       string `gtfs:"route_id"`       // Identifies a route associated with the fare class
	OriginId      string `gtfs:"origin_id"`      // Identifies an origin zone
	DestinationId string `gtfs:"destination_id"` // Identifies a destination zone
	ContainsId    string `gtfs:"contains_id"`    // Identifies zones that a rider will enter while using a given fare class
}

/* SHAPES */
type ShapeRaw struct {
	ShapeId           string `gtfs:"shape_id"`
	ShapePtLat        string `gtfs:"shape_pt_lat"`
	ShapePtLon        string `gtfs:"shape_pt_lon"`
	ShapePtSequence   string `gtfs:"shape_pt_sequence"`
	ShapeDistTraveled string `gtfs:"shape_dist_traveled"`
}

/* FREQUENCIES */
type FrequenciesRaw struct {
	EndTime     string `gtfs:"end_time"`
	ExactTimes  string `gtfs:"exact_times"`
	HeadwaySecs string `gtfs:"headway_secs"`
	StartTime   string `gtfs:"start_time"`
	TripId      string `gtfs:"trip_id"`
}

/* TRANSFERS */
type TransfersRaw struct {
	FromRouteId     string `gtfs:"from_route_id"`
	FromStopId      string `gtfs:"from_stop_id"`
	FromTripId      string `gtfs:"from_trip_id"`
	MinTransferTime string `gtfs:"min_transfer_time"`
	ToRouteId       string `gtfs:"to_route_id"`
	ToStopId        string `gtfs:"to_stop_id"`
	ToTripId        string `gtfs:"to_trip_id"`
	TransferType    string `gtfs:"transfer_type"`
}

/* PATHWAYS */
type PathwaysRaw struct {
	FromStopId           string `gtfs:"from_stop_id"`
	IsBidirectional      string `gtfs:"is_bidirectional"`
	Length               string `gtfs:"length"`
	MaxSlope             string `gtfs:"max_slope"`
	MinWidth             string `gtfs:"min_width"`
	PathwayId            string `gtfs:"pathway_id"`
	PathwayMode          string `gtfs:"pathway_mode"`
	ReversedSignpostedAs string `gtfs:"reversed_signposted_as"`
	SignpostedAs         string `gtfs:"signposted_as"`
	StairCount           string `gtfs:"stair_count"`
	ToStopId             string `gtfs:"to_stop_id"`
	TraversalTime        string `gtfs:"traversal_time"`
}

/* LEVELS */
type LevelsRaw struct {
	LevelId    string `gtfs:"level_id"`
	LevelIndex string `gtfs:"level_index"`
	LevelName  string `gtfs:"level_name"`
}

/* FEED INFO */
type FeedInfoRaw struct {
	// Required fields
	FeedLang          string `gtfs:"feed_lang"`
	FeedPublisherName string `gtfs:"feed_publisher_name"`
	FeedPublisherUrl  string `gtfs:"feed_publisher_url"`

	// Optional fields
	DefaultLang      string `gtfs:"default_lang"`
	FeedContactEmail string `gtfs:"feed_contact_email"`
	FeedContactUrl   string `gtfs:"feed_contact_url"`
	FeedEndDate      string `gtfs:"feed_end_date"`
	FeedStartDate    string `gtfs:"feed_start_date"`
	FeedVersion      string `gtfs:"feed_version"`
}

/* TRANSLATIONS */
type TranslationsRaw struct {
	FieldName   string `gtfs:"field_name"`
	FieldValue  string `gtfs:"field_value"`
	Language    string `gtfs:"language"`
	RecordId    string `gtfs:"record_id"`
	RecordSubId string `gtfs:"record_sub_id"`
	TableName   string `gtfs:"table_name"`
	Translation string `gtfs:"translation"`
}

/* ATTRIBUTIONS */
type AttributionsRaw struct {
	AgencyId         string `gtfs:"agency_id"`
	AttributionEmail string `gtfs:"attribution_email"`
	AttributionId    string `gtfs:"attribution_id"`
	AttributionPhone string `gtfs:"attribution_phone"`
	AttributionUrl   string `gtfs:"attribution_url"`
	IsAuthority      string `gtfs:"is_authority"`
	IsOperator       string `gtfs:"is_operator"`
	IsProducer       string `gtfs:"is_producer"`
	OrganizationName string `gtfs:"organization_name"`
	RouteId          string `gtfs:"route_id"`
	TripId           string `gtfs:"trip_id"`
}

/* TIMEFRAME */
type TimeframeRaw struct {
	EndTime          string `gtfs:"end_time"`
	ServiceId        string `gtfs:"service_id"`
	StartTime        string `gtfs:"start_time"`
	TimeframeGroupId string `gtfs:"timeframe_group_id"`
}

/* RIDER CATEGORY*/
type RiderCategoryRaw struct {
	EligibilityUrl        string `gtfs:"eligibility_url"`
	IsDefaultFareCategory string `gtfs:"is_default_fare_category"`
	RiderCategoryId       string `gtfs:"rider_category_id"`
	RiderCategoryName     string `gtfs:"rider_category_name"`
}

/* FARE MEDIA */
type FareMediaRaw struct {
	FareMediaId   string `gtfs:"fare_media_id"`
	FareMediaName string `gtfs:"fare_media_name"`
	FareMediaType string `gtfs:"fare_media_type"`
}

/* FARE PRODUCT */
type FareProductRaw struct {
	Ammount         string `gtfs:"ammount"`
	Currency        string `gtfs:"currency"`
	FareMediaId     string `gtfs:"fare_media_id"`
	FareProductId   string `gtfs:"fare_product_id"`
	FareProductName string `gtfs:"fare_product_name"`
	RiderCategoryId string `gtfs:"rider_category_id"`
}

/* FARE LEG RULE */
type FareLegRuleRaw struct {
	FareProductId        string `gtfs:"fare_product_id"`
	FromAreaId           string `gtfs:"from_area_id"`
	FromTimeframeGroupId string `gtfs:"from_timeframe_group_id"`
	LegGroupId           string `gtfs:"leg_group_id"`
	NetworkId            string `gtfs:"network_id"`
	RulePriority         string `gtfs:"rule_priority"`
	ToAreaId             string `gtfs:"to_area_id"`
	ToTimeframeGroupId   string `gtfs:"to_timeframe_group_id"`
}

/* FARE LEG JOIN RULE */
type FareLegJoinRuleRaw struct {
	FromNetworkId string `gtfs:"from_network_id"`
	FromStopId    string `gtfs:"from_stop_id"`
	ToNetworkId   string `gtfs:"to_network_id"`
	ToStopId      string `gtfs:"to_stop_id"`
}

/* FARETRANSFERRULE */
type FareTransferRuleRaw struct {
	DurationLimit     string `gtfs:"duration_limit"`
	DurationLimitType string `gtfs:"duration_limit_type"`
	FareProductId     string `gtfs:"fare_product_id"`
	FareTransferType  string `gtfs:"fare_transfer_type"`
	FromLegGroupId    string `gtfs:"from_leg_group_id"`
	ToLegGroupId      string `gtfs:"to_leg_group_id"`
	TransferCount     string `gtfs:"transfer_count"`
}

/* AREA */
type AreaRaw struct {
	AreaId   string `gtfs:"area_id"`
	AreaName string `gtfs:"area_name"`
}

/* STOPAREA */
type StopAreaRaw struct {
	AreaId string `gtfs:"area_id"`
	StopId string `gtfs:"stop_id"`
}

/* NETWORK */
type NetworkRaw struct {
	NetworkId   string `gtfs:"network_id"`
	NetworkName string `gtfs:"network_name"`
}

/* ROUTENETWORK */
type RouteNetworkRaw struct {
	NetworkId string `gtfs:"network_id"`
	RouteId   string `gtfs:"route_id"`
}

/* LOCATIONGROUP */
type LocationGroupRaw struct {
	LocationGroupId   string `gtfs:"location_group_id"`
	LocationGroupName string `gtfs:"location_group_name"`
}

/* LOCATIONGROUPSTOP */
type LocationGroupStopRaw struct {
	LocationGroupId string `gtfs:"location_group_id"`
	StopId          string `gtfs:"stop_id"`
}

/* BOOKINGRULE */
type BookingRuleRaw struct {
	BookingRuleId          string `gtfs:"booking_rule_id"`
	BookingType            string `gtfs:"booking_type"`
	BookingUrl             string `gtfs:"booking_url"`
	DropOffMessage         string `gtfs:"drop_off_message"`
	InfoUrl                string `gtfs:"info_url"`
	Message                string `gtfs:"message"`
	PhoneNumber            string `gtfs:"phone_number"`
	PickupMessage          string `gtfs:"pickup_message"`
	PriorNoticeDurationMax string `gtfs:"prior_notice_duration_max"`
	PriorNoticeDurationMin string `gtfs:"prior_notice_duration_min"`
	PriorNoticeLastDay     string `gtfs:"prior_notice_last_day"`
	PriorNoticeLastTime    string `gtfs:"prior_notice_last_time"`
	PriorNoticeServiceId   string `gtfs:"prior_notice_service_id"`
	PriorNoticeStartDay    string `gtfs:"prior_notice_start_day"`
	PriorNoticeStartTime   string `gtfs:"prior_notice_start_time"`
}

/* ARCHIVE */
type ArchiveRaw struct {
	ArchiveEndDate   string `gtfs:"archive_end_date"`
	ArchiveId        string `gtfs:"archive_id"`
	ArchiveStartDate string `gtfs:"archive_start_date"`
	OperatorId       string `gtfs:"operator_id"`
}

/* MUNICIPALITY */
type MunicipalityRaw struct {
	DistrictId         string `gtfs:"district_id"`
	DistrictName       string `gtfs:"district_name"`
	MunicipalityId     string `gtfs:"municipality_id"`
	MunicipalityName   string `gtfs:"municipality_name"`
	MunicipalityPrefix string `gtfs:"municipality_prefix"`
	RegionId           string `gtfs:"region_id"`
	RegionName         string `gtfs:"region_name"`
}

/* AFETACAO */
type AfetacaoRaw struct {
	AcceptedZoneCodes string `gtfs:"accepted_zone_codes"`
	AcceptedZoneNames string `gtfs:"accepted_zone_names"`
	Interchange       string `gtfs:"interchange"`
	LineId            string `gtfs:"line_id"`
	LineType          string `gtfs:"line_type"`
	OnboardFares      string `gtfs:"onboard_fares"`
	OperatorId        string `gtfs:"operator_id"`
	PatternId         string `gtfs:"pattern_id"`
	PrepaidFare       string `gtfs:"prepaid_fare"`
	PrepaidFarePrice  string `gtfs:"prepaid_fare_price"`
	StopId            string `gtfs:"stop_id"`
	StopName          string `gtfs:"stop_name"`
	StopSequence      string `gtfs:"stop_sequence"`
}

/* PERIOD */
type PeriodRaw struct {
	PeriodId   string `gtfs:"period_id"`
	PeriodName string `gtfs:"period_name"`
}

/* VEHICLE */
type VehicleRaw struct {
	VehicleId         string `gtfs:"vehicle_id"`
	AgencyId          string `gtfs:"agency_id"`
	LicensePlate      string `gtfs:"license_plate"`
	Make              string `gtfs:"make"`
	Model             string `gtfs:"model"`
	Owner             string `gtfs:"owner"`
	RegistrationDate  string `gtfs:"registration_date"`
	AvailableSeats    string `gtfs:"available_seats"`
	AvailableStanding string `gtfs:"available_standing"`
	Typology          string `gtfs:"typology"`
	Propulsion        string `gtfs:"propulsion"`
	Emission          string `gtfs:"emission"`
	Climatization     string `gtfs:"climatization"`
	Wheelchair        string `gtfs:"wheelchair"`
	LoweredFloor      string `gtfs:"lowered_floor"`
	Ramp              string `gtfs:"ramp"`
	Kneeling          string `gtfs:"kneeling"`
	StaticInformation string `gtfs:"static_information"`
	OnboardMonitor    string `gtfs:"onboard_monitor"`
	FrontDisplay      string `gtfs:"front_display"`
	RearDisplay       string `gtfs:"rear_display"`
	SideDisplay       string `gtfs:"side_display"`
	InternalSound     string `gtfs:"internal_sound"`
	ExternalSound     string `gtfs:"external_sound"`
	ConsumptionMeter  string `gtfs:"consumption_meter"`
	Bicycles          string `gtfs:"bicycles"`
	PassengerCounting string `gtfs:"passenger_counting"`
	VideoSurveillance string `gtfs:"video_surveillance"`
}

// Gtfs represents a collection of parsed GTFS data files where the key is the filename (without  extension)
// and the value is a slice of maps containing the CSV data with column headers as keys.
type GtfsFiles map[string][]map[string]string
type GtfsIdMap map[string]map[string][]int // key is the filename, value is a map of ids and their row number

type Gtfs struct {
	// SQLite database connection - data is stored here instead of in-memory slices
	db     *sql.DB
	dbPath string

	// Deprecated: Slice fields are kept for backward compatibility but are never populated.
	// All data is now stored in SQLite database. Use iterator methods (IterateStops, IterateTrips, etc.)
	// or getter methods (GetStop, GetTrip, etc.) to access data.
	// Migration guide: Replace `gtfs.Stop[i]` with `gtfs.GetStop(i)` or use `gtfs.IterateStops(...)`
	Agency            []AgencyRaw            `gtfs:"agency"`
	Stop              []StopRaw              `gtfs:"stop"`
	Route             []RouteRaw             `gtfs:"route"`
	Trip              []TripRaw              `gtfs:"trip"`
	StopTime          []StopTimeRaw          `gtfs:"stop_time"`
	Calendar          []CalendarRaw          `gtfs:"calendar"`
	CalendarDates     []CalendarDatesRaw     `gtfs:"calendar_dates"`
	FareAttribute     []FareAttributeRaw     `gtfs:"fare_attribute"`
	FareRule          []FareRuleRaw          `gtfs:"fare_rule"`
	Shape             []ShapeRaw             `gtfs:"shape"`
	Frequencies       []FrequenciesRaw       `gtfs:"frequencies"`
	Transfers         []TransfersRaw         `gtfs:"transfers"`
	Pathways          []PathwaysRaw          `gtfs:"pathways"`
	Levels            []LevelsRaw            `gtfs:"levels"`
	FeedInfo          []FeedInfoRaw          `gtfs:"feed_info"`
	Translations      []TranslationsRaw      `gtfs:"translations"`
	Attributions      []AttributionsRaw      `gtfs:"attributions"`
	Timeframe         []TimeframeRaw         `gtfs:"timeframe"`
	RiderCategory     []RiderCategoryRaw     `gtfs:"rider_category"`
	FareMedia         []FareMediaRaw         `gtfs:"fare_media"`
	FareProduct       []FareProductRaw       `gtfs:"fare_product"`
	FareLegRule       []FareLegRuleRaw       `gtfs:"fare_leg_rule"`
	FareLegJoinRule   []FareLegJoinRuleRaw   `gtfs:"fare_leg_join_rule"`
	FareTransferRule  []FareTransferRuleRaw  `gtfs:"fare_transfer_rule"`
	Area              []AreaRaw              `gtfs:"area"`
	StopArea          []StopAreaRaw          `gtfs:"stop_area"`
	Network           []NetworkRaw           `gtfs:"network"`
	RouteNetwork      []RouteNetworkRaw      `gtfs:"route_network"`
	LocationGroup     []LocationGroupRaw     `gtfs:"location_group"`
	LocationGroupStop []LocationGroupStopRaw `gtfs:"location_group_stop"`
	BookingRule       []BookingRuleRaw       `gtfs:"booking_rule"`
	Archive           []ArchiveRaw           `gtfs:"archive"`
	Municipality      []MunicipalityRaw      `gtfs:"municipality"`
	Afetacao          []AfetacaoRaw          `gtfs:"afetacao"`
	Period            []PeriodRaw            `gtfs:"period"`

	IdMap map[string]map[string][]int // key is the filename, value is a map of ids and their row number
}

// NewGtfs creates a new empty Gtfs struct (for backward compatibility)
func NewGtfs() *Gtfs {
	return &Gtfs{
		IdMap: make(map[string]map[string][]int),
	}
}

// NewGtfsFromSQLite creates a new Gtfs struct with SQLite database connection
func NewGtfsFromSQLite(db *sql.DB, dbPath string) *Gtfs {
	return &Gtfs{
		db:     db,
		dbPath: dbPath,
		IdMap:  make(map[string]map[string][]int),
	}
}

// Close closes the SQLite database connection
func (g *Gtfs) Close() error {
	if g.db != nil {
		return g.db.Close()
	}
	return nil
}

// DB returns the underlying SQLite database connection
func (g *Gtfs) DB() *sql.DB {
	return g.db
}

// DBPath returns the path to the SQLite database file
func (g *Gtfs) DBPath() string {
	return g.dbPath
}

// HasTable checks if a table exists in the SQLite database
func (g *Gtfs) HasTable(table string) bool {
	if g.db == nil {
		return false
	}
	var count int
	err := g.db.QueryRow("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?", sanitizeTableNameForQuery(table)).Scan(&count)
	return err == nil && count > 0
}

// GetTableCount returns the number of rows in a table
func (g *Gtfs) GetTableCount(table string) (int, error) {
	if g.db == nil {
		return 0, fmt.Errorf("database connection is nil")
	}
	var count int
	err := g.db.QueryRow(fmt.Sprintf("SELECT COUNT(*) FROM %s", sanitizeTableNameForQuery(table))).Scan(&count)
	return count, err
}

// GetRowsById returns the row indices for a given table and ID from the id_map table
func (g *Gtfs) GetRowsById(table, id string) ([]int, error) {
	if g.db == nil {
		return nil, fmt.Errorf("database connection is nil")
	}
	rows, err := g.db.Query("SELECT row_index FROM id_map WHERE file = ? AND key = ? ORDER BY row_index", table, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []int
	for rows.Next() {
		var rowIndex int
		if err := rows.Scan(&rowIndex); err != nil {
			return nil, err
		}
		result = append(result, rowIndex)
	}
	return result, rows.Err()
}

// getCachedRowsById returns rows from cache if present, otherwise fetches via GetRowsById and stores in cache.
func (g *Gtfs) GetCachedRowsById(cache map[string][]int, table, id string) ([]int, error) {
	if rows, ok := cache[id]; ok {
		return rows, nil
	}
	rows, err := g.GetRowsById(table, id)
	if err != nil {
		return nil, err
	}
	cache[id] = rows
	return rows, nil
}

// GetRowsByField returns the row indices for a given table and column value from the actual table data.
// Unlike GetRowsById which queries the id_map table, this queries the real table directly.
// This is useful for checking uniqueness of non-primary-key fields (e.g., license_plate).
func (g *Gtfs) GetRowsByField(table, column, value string) ([]int, error) {
	if g.db == nil {
		return nil, fmt.Errorf("database connection is nil")
	}
	tableName := sanitizeTableNameForQuery(table)
	query := fmt.Sprintf("SELECT rowid - 1 FROM %s WHERE %s = ? ORDER BY rowid", tableName, column)
	rows, err := g.db.Query(query, value)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []int
	for rows.Next() {
		var rowIndex int
		if err := rows.Scan(&rowIndex); err != nil {
			return nil, err
		}
		result = append(result, rowIndex)
	}
	return result, rows.Err()
}

// sanitizeTableNameForQuery sanitizes table name for use in queries (without quotes for table name)
func sanitizeTableNameForQuery(name string) string {
	return strings.ReplaceAll(name, "-", "_")
}

// convertRowToStruct converts a map[string]string to a struct using reflection
func convertRowToStruct[T any](row map[string]string) T {
	var result T
	v := reflect.ValueOf(&result).Elem()
	t := v.Type()

	for i := 0; i < v.NumField(); i++ {
		field := v.Field(i)
		fieldType := t.Field(i)
		tag := fieldType.Tag.Get("gtfs")

		if tag != "" && tag != "-" {
			if value, exists := row[tag]; exists && field.CanSet() {
				field.SetString(value)
			}
		}
	}

	return result
}

// queryTableRowByIndex gets a specific row by index from a table
func (g *Gtfs) queryTableRowByIndex(table string, rowIndex int) (map[string]string, error) {
	if g.db == nil {
		return nil, fmt.Errorf("database connection is nil")
	}

	tableName := sanitizeTableNameForQuery(table)

	// Get column names
	rows, err := g.db.Query(fmt.Sprintf("SELECT * FROM %s LIMIT 0", tableName))
	if err != nil {
		return nil, fmt.Errorf("failed to query table %s: %w", table, err)
	}
	columns, err := rows.Columns()
	rows.Close()
	if err != nil {
		return nil, fmt.Errorf("failed to get columns: %w", err)
	}

	// Query by rowid for O(1) lookup (SQLite rowid is 1-based, rowIndex is 0-based)
	rows, err = g.db.Query(fmt.Sprintf("SELECT * FROM %s WHERE rowid = ?", tableName), rowIndex+1)
	if err != nil {
		return nil, fmt.Errorf("failed to query row: %w", err)
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, fmt.Errorf("row index %d not found in table %s", rowIndex, table)
	}

	// Create slice of pointers to hold row values
	values := make([]interface{}, len(columns))
	valuePtrs := make([]interface{}, len(columns))
	for i := range values {
		valuePtrs[i] = &values[i]
	}

	if err := rows.Scan(valuePtrs...); err != nil {
		return nil, fmt.Errorf("failed to scan row: %w", err)
	}

	// Convert row to map
	rowMap := make(map[string]string)
	for i, col := range columns {
		val := values[i]
		if val != nil {
			colName := strings.Trim(col, `"`)
			rowMap[colName] = fmt.Sprintf("%v", val)
		} else {
			colName := strings.Trim(col, `"`)
			rowMap[colName] = ""
		}
	}

	return rowMap, nil
}

// IterateStops iterates over all stops, calling fn for each stop
func (g *Gtfs) IterateStops(fn func(int, StopRaw) error) error {
	return g.iterateTable("stops", func(rowIndex int, row map[string]string) error {
		stopRaw := convertRowToStruct[StopRaw](row)
		return fn(rowIndex, stopRaw)
	})
}

// GetStop retrieves a stop by row index
func (g *Gtfs) GetStop(rowIndex int) (StopRaw, error) {
	row, err := g.queryTableRowByIndex("stops", rowIndex)
	if err != nil {
		return StopRaw{}, err
	}
	return convertRowToStruct[StopRaw](row), nil
}

// IterateTrips iterates over all trips, calling fn for each trip
func (g *Gtfs) IterateTrips(fn func(int, TripRaw) error) error {
	return g.iterateTable("trips", func(rowIndex int, row map[string]string) error {
		tripRaw := convertRowToStruct[TripRaw](row)
		return fn(rowIndex, tripRaw)
	})
}

// GetTrip retrieves a trip by row index
func (g *Gtfs) GetTrip(rowIndex int) (TripRaw, error) {
	row, err := g.queryTableRowByIndex("trips", rowIndex)
	if err != nil {
		return TripRaw{}, err
	}
	return convertRowToStruct[TripRaw](row), nil
}

// IterateStopTimes iterates over all stop times, calling fn for each stop time
func (g *Gtfs) IterateStopTimes(fn func(int, StopTimeRaw) error) error {
	return g.iterateTable("stop_times", func(rowIndex int, row map[string]string) error {
		stopTimeRaw := convertRowToStruct[StopTimeRaw](row)
		return fn(rowIndex, stopTimeRaw)
	})
}

// GetStopTime retrieves a stop time by row index
func (g *Gtfs) GetStopTime(rowIndex int) (StopTimeRaw, error) {
	row, err := g.queryTableRowByIndex("stop_times", rowIndex)
	if err != nil {
		return StopTimeRaw{}, err
	}
	return convertRowToStruct[StopTimeRaw](row), nil
}

// IterateRoutes iterates over all routes, calling fn for each route
func (g *Gtfs) IterateRoutes(fn func(int, RouteRaw) error) error {
	return g.iterateTable("routes", func(rowIndex int, row map[string]string) error {
		routeRaw := convertRowToStruct[RouteRaw](row)
		return fn(rowIndex, routeRaw)
	})
}

// GetRoute retrieves a route by row index
func (g *Gtfs) GetRoute(rowIndex int) (RouteRaw, error) {
	row, err := g.queryTableRowByIndex("routes", rowIndex)
	if err != nil {
		return RouteRaw{}, err
	}
	return convertRowToStruct[RouteRaw](row), nil
}

// IterateAgencies iterates over all agencies, calling fn for each agency
func (g *Gtfs) IterateAgencies(fn func(int, AgencyRaw) error) error {
	return g.iterateTable("agency", func(rowIndex int, row map[string]string) error {
		agencyRaw := convertRowToStruct[AgencyRaw](row)
		return fn(rowIndex, agencyRaw)
	})
}

// GetAgency retrieves an agency by row index
func (g *Gtfs) GetAgency(rowIndex int) (AgencyRaw, error) {
	row, err := g.queryTableRowByIndex("agency", rowIndex)
	if err != nil {
		return AgencyRaw{}, err
	}
	return convertRowToStruct[AgencyRaw](row), nil
}

// IterateShapes iterates over all shapes, calling fn for each shape
func (g *Gtfs) IterateShapes(fn func(int, ShapeRaw) error) error {
	return g.iterateTable("shapes", func(rowIndex int, row map[string]string) error {
		shapeRaw := convertRowToStruct[ShapeRaw](row)
		return fn(rowIndex, shapeRaw)
	})
}

// GetShape retrieves a shape by row index
func (g *Gtfs) GetShape(rowIndex int) (ShapeRaw, error) {
	row, err := g.queryTableRowByIndex("shapes", rowIndex)
	if err != nil {
		return ShapeRaw{}, err
	}
	return convertRowToStruct[ShapeRaw](row), nil
}

// GetShapesByShapeId retrieves all shape points for a shape_id in one query.
// More efficient than GetRowsById + GetShape per row when loading full shapes.
func (g *Gtfs) GetShapesByShapeId(shapeId string) ([]ShapeRaw, error) {
	if g.db == nil {
		return nil, fmt.Errorf("database connection is nil")
	}
	tableName := sanitizeTableNameForQuery("shapes")
	rows, err := g.db.Query(fmt.Sprintf("SELECT * FROM %s WHERE shape_id = ? ORDER BY shape_pt_sequence", tableName), shapeId)
	if err != nil {
		return nil, fmt.Errorf("failed to query shapes: %w", err)
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	var result []ShapeRaw
	for rows.Next() {
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range values {
			valuePtrs[i] = &values[i]
		}
		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, err
		}
		rowMap := make(map[string]string)
		for i, col := range columns {
			colName := strings.Trim(col, `"`)
			if values[i] != nil {
				rowMap[colName] = fmt.Sprintf("%v", values[i])
			} else {
				rowMap[colName] = ""
			}
		}
		result = append(result, convertRowToStruct[ShapeRaw](rowMap))
	}
	return result, rows.Err()
}

// IteratePathways iterates over all pathways, calling fn for each pathway
func (g *Gtfs) IteratePathways(fn func(int, PathwaysRaw) error) error {
	return g.iterateTable("pathways", func(rowIndex int, row map[string]string) error {
		pathwayRaw := convertRowToStruct[PathwaysRaw](row)
		return fn(rowIndex, pathwayRaw)
	})
}

// GetPathway retrieves a pathway by row index
func (g *Gtfs) GetPathway(rowIndex int) (PathwaysRaw, error) {
	row, err := g.queryTableRowByIndex("pathways", rowIndex)
	if err != nil {
		return PathwaysRaw{}, err
	}
	return convertRowToStruct[PathwaysRaw](row), nil
}

// IterateFeedInfos iterates over all feed info records, calling fn for each
func (g *Gtfs) IterateFeedInfos(fn func(int, FeedInfoRaw) error) error {
	return g.iterateTable("feed_info", func(rowIndex int, row map[string]string) error {
		feedInfoRaw := convertRowToStruct[FeedInfoRaw](row)
		return fn(rowIndex, feedInfoRaw)
	})
}

// GetFeedInfo retrieves a feed info by row index
func (g *Gtfs) GetFeedInfo(rowIndex int) (FeedInfoRaw, error) {
	row, err := g.queryTableRowByIndex("feed_info", rowIndex)
	if err != nil {
		return FeedInfoRaw{}, err
	}
	return convertRowToStruct[FeedInfoRaw](row), nil
}

// IterateTranslations iterates over all translations, calling fn for each
func (g *Gtfs) IterateTranslations(fn func(int, TranslationsRaw) error) error {
	return g.iterateTable("translations", func(rowIndex int, row map[string]string) error {
		translationRaw := convertRowToStruct[TranslationsRaw](row)
		return fn(rowIndex, translationRaw)
	})
}

// GetTranslation retrieves a translation by row index
func (g *Gtfs) GetTranslation(rowIndex int) (TranslationsRaw, error) {
	row, err := g.queryTableRowByIndex("translations", rowIndex)
	if err != nil {
		return TranslationsRaw{}, err
	}
	return convertRowToStruct[TranslationsRaw](row), nil
}

// IterateRouteNetworks iterates over all route networks, calling fn for each
func (g *Gtfs) IterateRouteNetworks(fn func(int, RouteNetworkRaw) error) error {
	return g.iterateTable("route_networks", func(rowIndex int, row map[string]string) error {
		routeNetworkRaw := convertRowToStruct[RouteNetworkRaw](row)
		return fn(rowIndex, routeNetworkRaw)
	})
}

// GetRouteNetwork retrieves a route network by row index
func (g *Gtfs) GetRouteNetwork(rowIndex int) (RouteNetworkRaw, error) {
	row, err := g.queryTableRowByIndex("route_networks", rowIndex)
	if err != nil {
		return RouteNetworkRaw{}, err
	}
	return convertRowToStruct[RouteNetworkRaw](row), nil
}

// IterateNetworks iterates over all networks, calling fn for each
func (g *Gtfs) IterateNetworks(fn func(int, NetworkRaw) error) error {
	return g.iterateTable("networks", func(rowIndex int, row map[string]string) error {
		networkRaw := convertRowToStruct[NetworkRaw](row)
		return fn(rowIndex, networkRaw)
	})
}

// GetNetwork retrieves a network by row index
func (g *Gtfs) GetNetwork(rowIndex int) (NetworkRaw, error) {
	row, err := g.queryTableRowByIndex("networks", rowIndex)
	if err != nil {
		return NetworkRaw{}, err
	}
	return convertRowToStruct[NetworkRaw](row), nil
}

// IterateCalendars iterates over all calendars, calling fn for each
func (g *Gtfs) IterateCalendars(fn func(int, CalendarRaw) error) error {
	return g.iterateTable("calendar", func(rowIndex int, row map[string]string) error {
		calendarRaw := convertRowToStruct[CalendarRaw](row)
		return fn(rowIndex, calendarRaw)
	})
}

// GetCalendar retrieves a calendar by row index
func (g *Gtfs) GetCalendar(rowIndex int) (CalendarRaw, error) {
	row, err := g.queryTableRowByIndex("calendar", rowIndex)
	if err != nil {
		return CalendarRaw{}, err
	}
	return convertRowToStruct[CalendarRaw](row), nil
}

// IterateCalendarDates iterates over all calendar dates, calling fn for each
func (g *Gtfs) IterateCalendarDates(fn func(int, CalendarDatesRaw) error) error {
	return g.iterateTable("calendar_dates", func(rowIndex int, row map[string]string) error {
		calendarDateRaw := convertRowToStruct[CalendarDatesRaw](row)
		return fn(rowIndex, calendarDateRaw)
	})
}

// GetCalendarDate retrieves a calendar date by row index
func (g *Gtfs) GetCalendarDate(rowIndex int) (CalendarDatesRaw, error) {
	row, err := g.queryTableRowByIndex("calendar_dates", rowIndex)
	if err != nil {
		return CalendarDatesRaw{}, err
	}
	return convertRowToStruct[CalendarDatesRaw](row), nil
}

// IterateFareMedia iterates over all fare media, calling fn for each
func (g *Gtfs) IterateFareMedia(fn func(int, FareMediaRaw) error) error {
	return g.iterateTable("fare_media", func(rowIndex int, row map[string]string) error {
		fareMediaRaw := convertRowToStruct[FareMediaRaw](row)
		return fn(rowIndex, fareMediaRaw)
	})
}

// IterateFareRules iterates over all fare rules, calling fn for each
func (g *Gtfs) IterateFareRules(fn func(int, FareRuleRaw) error) error {
	return g.iterateTable("fare_rules", func(rowIndex int, row map[string]string) error {
		fareRuleRaw := convertRowToStruct[FareRuleRaw](row)
		return fn(rowIndex, fareRuleRaw)
	})
}

// GetFareRule retrieves a fare rule by row index
func (g *Gtfs) GetFareRule(rowIndex int) (FareRuleRaw, error) {
	row, err := g.queryTableRowByIndex("fare_rules", rowIndex)
	if err != nil {
		return FareRuleRaw{}, err
	}
	return convertRowToStruct[FareRuleRaw](row), nil
}

// IterateFareAttributes iterates over all fare attributes, calling fn for each
func (g *Gtfs) IterateFareAttributes(fn func(int, FareAttributeRaw) error) error {
	return g.iterateTable("fare_attributes", func(rowIndex int, row map[string]string) error {
		fareAttributeRaw := convertRowToStruct[FareAttributeRaw](row)
		return fn(rowIndex, fareAttributeRaw)
	})
}

// GetFareAttribute retrieves a fare attribute by row index
func (g *Gtfs) GetFareAttribute(rowIndex int) (FareAttributeRaw, error) {
	row, err := g.queryTableRowByIndex("fare_attributes", rowIndex)
	if err != nil {
		return FareAttributeRaw{}, err
	}
	return convertRowToStruct[FareAttributeRaw](row), nil
}

// IterateRiderCategories iterates over all rider categories, calling fn for each
func (g *Gtfs) IterateRiderCategories(fn func(int, RiderCategoryRaw) error) error {
	return g.iterateTable("rider_categories", func(rowIndex int, row map[string]string) error {
		riderCategoryRaw := convertRowToStruct[RiderCategoryRaw](row)
		return fn(rowIndex, riderCategoryRaw)
	})
}

// IterateFrequencies iterates over all frequencies, calling fn for each
func (g *Gtfs) IterateFrequencies(fn func(int, FrequenciesRaw) error) error {
	return g.iterateTable("frequencies", func(rowIndex int, row map[string]string) error {
		frequencyRaw := convertRowToStruct[FrequenciesRaw](row)
		return fn(rowIndex, frequencyRaw)
	})
}

// IterateVehicles iterates over all vehicles, calling fn for each
func (g *Gtfs) IterateVehicles(fn func(int, VehicleRaw) error) error {
	return g.iterateTable("vehicles", func(rowIndex int, row map[string]string) error {
		vehicleRaw := convertRowToStruct[VehicleRaw](row)
		return fn(rowIndex, vehicleRaw)
	})
}

// IterateLevels iterates over all levels, calling fn for each
func (g *Gtfs) IterateLevels(fn func(int, LevelsRaw) error) error {
	return g.iterateTable("levels", func(rowIndex int, row map[string]string) error {
		levelRaw := convertRowToStruct[LevelsRaw](row)
		return fn(rowIndex, levelRaw)
	})
}

// IterateTransfers iterates over all transfers, calling fn for each
func (g *Gtfs) IterateTransfers(fn func(int, TransfersRaw) error) error {
	return g.iterateTable("transfers", func(rowIndex int, row map[string]string) error {
		transfersRaw := convertRowToStruct[TransfersRaw](row)
		return fn(rowIndex, transfersRaw)
	})
}

// GetVehicle retrieves a vehicle by row index
// iterateTable is a generic helper to iterate over table rows
func (g *Gtfs) iterateTable(table string, fn func(int, map[string]string) error) error {
	if g.db == nil {
		return fmt.Errorf("database connection is nil")
	}

	tableName := sanitizeTableNameForQuery(table)

	// Get column names
	rows, err := g.db.Query(fmt.Sprintf("SELECT * FROM %s LIMIT 0", tableName))
	if err != nil {
		// Table might not exist, return nil error to allow graceful handling
		return nil
	}
	columns, err := rows.Columns()
	rows.Close()
	if err != nil {
		return fmt.Errorf("failed to get columns: %w", err)
	}

	// Query all rows
	rows, err = g.db.Query(fmt.Sprintf("SELECT * FROM %s ORDER BY rowid", tableName))
	if err != nil {
		// Table might not exist, return nil error to allow graceful handling
		return nil
	}
	defer rows.Close()

	rowIndex := 0
	for rows.Next() {
		// Create slice of pointers to hold row values
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range values {
			valuePtrs[i] = &values[i]
		}

		if err := rows.Scan(valuePtrs...); err != nil {
			return fmt.Errorf("failed to scan row: %w", err)
		}

		// Convert row to map
		rowMap := make(map[string]string)
		for i, col := range columns {
			val := values[i]
			if val != nil {
				colName := strings.Trim(col, `"`)
				rowMap[colName] = fmt.Sprintf("%v", val)
			} else {
				colName := strings.Trim(col, `"`)
				rowMap[colName] = ""
			}
		}

		if err := fn(rowIndex, rowMap); err != nil {
			return err
		}
		rowIndex++
	}

	return rows.Err()
}

// findFieldByPath traverses the struct based on a dot-separated path and tag name.
// It returns the reflect.Value of the final field.
func findFieldByPath(obj any, path string) (reflect.Value, error) {
	// Start with the reflection value of the object.
	// We need a pointer to be able to set values, so we start by getting the element.
	v := reflect.ValueOf(obj).Elem()

	// Split the path into parts (e.g., "socials.facebook" -> ["socials", "facebook"])
	parts := strings.Split(path, ".")

	// Traverse the path
	for _, part := range parts {
		// If we are not on a struct, we can't go deeper.
		if v.Kind() != reflect.Struct {
			return reflect.Value{}, fmt.Errorf("cannot access field %s on a non-struct type %s", part, v.Kind())
		}

		// Find the field in the current struct that matches the tag.
		found := false
		for i := 0; i < v.NumField(); i++ {
			fieldTag := v.Type().Field(i).Tag.Get("gtfs")
			if fieldTag == part {
				v = v.Field(i)
				found = true
				break
			}
		}

		if !found {
			return reflect.Value{}, fmt.Errorf("field with tag '%s' not found in path '%s'", part, path)
		}
	}
	return v, nil
}

// SetField sets a field on the user struct using a path and a string value.
// It handles basic type conversion (e.g., string to int).
func (u *Gtfs) SetField(path string, value string) error {
	fieldVal, err := findFieldByPath(u, path)
	if err != nil {
		return err
	}

	// Check if the field is actually settable (i.e., it's exported).
	if !fieldVal.CanSet() {
		return fmt.Errorf("field at path '%s' is not settable", path)
	}

	// Perform type conversion based on the field's kind.
	switch fieldVal.Kind() {
	case reflect.String:
		fieldVal.SetString(value)
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		intValue, err := strconv.ParseInt(value, 10, 64)
		if err != nil {
			return fmt.Errorf("could not parse '%s' as an integer for path '%s': %w", value, path, err)
		}
		fieldVal.SetInt(intValue)
	// Add other types like bool, float64 as needed
	// case reflect.Bool: ...
	default:
		return fmt.Errorf("unsupported field type %s at path '%s'", fieldVal.Kind(), path)
	}

	return nil
}

// GetField retrieves a field's value from the user struct as a string.
func (u *Gtfs) GetField(path string) (string, error) {
	fieldVal, err := findFieldByPath(u, path)
	if err != nil {
		return "", err
	}

	// Use fmt.Sprintf to reliably convert any value to its string representation.
	return fmt.Sprintf("%v", fieldVal.Interface()), nil
}

// SetFieldData converts CSV map data to the appropriate struct slice and sets it on the Gtfs struct
func (u *Gtfs) SetFieldData(filename string, data []map[string]string) error {
	switch filename {
	case "agency":
		u.Agency = convertToStructSlice[AgencyRaw](data)
	case "stops":
		u.Stop = convertToStructSlice[StopRaw](data)
	case "routes":
		u.Route = convertToStructSlice[RouteRaw](data)
	case "trips":
		u.Trip = convertToStructSlice[TripRaw](data)
	case "stop_times":
		u.StopTime = convertToStructSlice[StopTimeRaw](data)
	case "calendar":
		u.Calendar = convertToStructSlice[CalendarRaw](data)
	case "calendar_dates":
		u.CalendarDates = convertToStructSlice[CalendarDatesRaw](data)
	case "fare_attributes":
		u.FareAttribute = convertToStructSlice[FareAttributeRaw](data)
	case "fare_rules":
		u.FareRule = convertToStructSlice[FareRuleRaw](data)
	case "shapes":
		u.Shape = convertToStructSlice[ShapeRaw](data)
	case "frequencies":
		u.Frequencies = convertToStructSlice[FrequenciesRaw](data)
	case "transfers":
		u.Transfers = convertToStructSlice[TransfersRaw](data)
	case "pathways":
		u.Pathways = convertToStructSlice[PathwaysRaw](data)
	case "levels":
		u.Levels = convertToStructSlice[LevelsRaw](data)
	case "feed_info":
		u.FeedInfo = convertToStructSlice[FeedInfoRaw](data)
	case "translations":
		u.Translations = convertToStructSlice[TranslationsRaw](data)
	case "attributions":
		u.Attributions = convertToStructSlice[AttributionsRaw](data)
	case "archives":
		u.Archive = convertToStructSlice[ArchiveRaw](data)
	case "municipalities":
		u.Municipality = convertToStructSlice[MunicipalityRaw](data)
	case "periods":
		u.Period = convertToStructSlice[PeriodRaw](data)
	default:
		return fmt.Errorf("unknown GTFS file: %s", filename)
	}
	return nil
}

// convertToStructSlice converts CSV map data to a slice of structs using reflection
func convertToStructSlice[T any](data []map[string]string) []T {
	result := make([]T, len(data))
	for i, row := range data {
		var item T
		v := reflect.ValueOf(&item).Elem()
		t := v.Type()

		for j := 0; j < v.NumField(); j++ {
			field := v.Field(j)
			fieldType := t.Field(j)
			tag := fieldType.Tag.Get("gtfs")

			if tag != "" && tag != "-" {
				if value, exists := row[tag]; exists && field.CanSet() {
					field.SetString(value)
				}
			}
		}
		result[i] = item
	}
	return result
}
