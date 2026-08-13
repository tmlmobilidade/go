package types

/* PRIMARY KEYS */
var GTFS_PRIMARY_KEYS = map[string]any{
	"afetacao":             nil,
	"agency":               "agency_id",
	"archives":             "archive_id",
	"areas":                "area_id",
	"attributions":         "attribution_id",
	"booking_rules":        "booking_rule_id",
	"calendar_dates":       []string{"service_id", "date"},
	"calendar":             "service_id",
	"dates":                nil,
	"fare_attributes":      "fare_id",
	"fare_leg_join_rules":  []string{"from_network_id", "to_network_id", "from_stop_id", "to_stop_id"},
	"fare_leg_rules":       []string{"network_id", "from_area_id", "to_area_id", "from_timeframe_group_id", "to_timeframe_group_id", "fare_product_id"},
	"fare_media":           "fare_media_id",
	"fare_products":        "fare_product_id",
	"fare_rules":           nil,
	"fare_transfer_rules":  []string{"from_leg_group_id", "to_leg_group_id", "fare_product_id", "transfer_count", "duration_limit"},
	"feed_info":            nil,
	"frequencies":          []string{"trip_id", "start_time"},
	"levels":               "level_id",
	"location_group_stops": []string{"location_group_id", "stop_id"},
	"location_groups":      "location_group_id",
	"municipalities":       "municipality_id",
	"networks":             "network_id",
	"pathways":             "pathway_id",
	"periods":              "period_id",
	"rider_categories":     "rider_category_id",
	"route_networks":       "route_id",
	"routes":               "route_id",
	"shapes":               []string{"shape_id", "shape_pt_sequence"},
	"stop_areas":           []string{"area_id", "stop_id"},
	"stop_times":           []string{"trip_id", "stop_sequence"},
	"stops":                []string{"stop_id", "zone_id", "stop_code"},
	"timeframes":           nil,
	"transfers":            []string{"from_stop_id", "to_stop_id", "from_trip_id", "to_trip_id", "from_route_id", "to_route_id"},
	"translations":         []string{"table_name", "field_name", "language", "record_id", "record_sub_id", "field_value"},
	"trips":                []string{"trip_id", "route_id"},
	"vehicles":             "vehicle_id",
}

/* AGENCY */
type Agency struct {
	AgencyEmail    *string `json:"agency_email"`
	AgencyFareUrl  *string `json:"agency_fare_url"`
	AgencyId       *string `json:"agency_id"`
	AgencyLang     *string `json:"agency_lang"`
	AgencyName     *string `json:"agency_name"`
	AgencyPhone    *string `json:"agency_phone"`
	AgencyTimezone *string `json:"agency_timezone"`
	AgencyUrl      *string `json:"agency_url"`
}

/* STOP */
type Stop struct {
	HasBench              *int     `json:"has_bench,omitempty"`
	HasNetworkMap         *int     `json:"has_network_map,omitempty"`
	HasPipRealTime        *int     `json:"has_pip_real_time,omitempty"`
	HasSchedules          *int     `json:"has_schedules,omitempty"`
	HasShelter            *int     `json:"has_shelter,omitempty"`
	HasStopSign           *int     `json:"has_stop_sign,omitempty"`
	HasTariffsInformation *int     `json:"has_tariffs_information,omitempty"`
	LevelId               *string  `json:"level_id,omitempty"`
	LocationType          *int     `json:"location_type,omitempty"`
	MunicipalityId        *string  `json:"municipality_id,omitempty"`
	ParentStation         *string  `json:"parent_station,omitempty"`
	ParishId              *string  `json:"parish_id,omitempty"`
	PlatformCode          *string  `json:"platform_code,omitempty"`
	PublicVisible         *int     `json:"public_visible,omitempty"`
	RegionId              *string  `json:"region_id,omitempty"`
	ShelterCode           *string  `json:"shelter_code,omitempty"`
	ShelterMaintainer     *string  `json:"shelter_maintainer,omitempty"`
	StopCode              *string  `json:"stop_code,omitempty"`
	StopDesc              *string  `json:"stop_desc,omitempty"`
	StopId                *string  `json:"stop_id"`
	StopLat               *float32 `json:"stop_lat,omitempty"`
	StopLon               *float32 `json:"stop_lon,omitempty"`
	StopName              *string  `json:"stop_name,omitempty"`
	StopShortName         *string  `json:"stop_short_name,omitempty"`
	StopTimezone          *string  `json:"stop_timezone,omitempty"`
	StopUrl               *string  `json:"stop_url,omitempty"`
	TtsStopName           *string  `json:"tts_stop_name,omitempty"`
	WheelchairBoarding    *int     `json:"wheelchair_boarding,omitempty"`
	ZoneId                *string  `json:"zone_id,omitempty"`
	StopAccess            *int     `json:"stop_access,omitempty"`
}

/* ROUTE */
type Route struct {
	// Required fields
	RouteId   *string `json:"route_id"`
	RouteType *int    `json:"route_type"`
	LineId    *string `json:"line_id"`

	// Optional fields
	AgencyId          *string `json:"agency_id"`
	ContinuousDropOff *string `json:"continuous_drop_off"`
	ContinuousPickup  *string `json:"continuous_pickup"`
	LineShortName     *string `json:"line_short_name"`
	LineLongName      *string `json:"line_long_name"`
	RouteColor        *string `json:"route_color"`
	RouteDesc         *string `json:"route_desc"`
	RouteLongName     *string `json:"route_long_name"`
	RouteShortName    *string `json:"route_short_name"`
	RouteSortOrder    *int    `json:"route_sort_order"`
	RouteTextColor    *string `json:"route_text_color"`
	RouteUrl          *string `json:"route_url"`
	NetworkId         *string `json:"network_id"`
	PathType          *string `json:"path_type"`
}

/* TRIP */

type Trip struct {
	BikesAllowed         *int    `json:"bikes_allowed"`
	BlockId              *string `json:"block_id"`
	CalendarDesc         *string `json:"calendar_desc"`
	DirectionId          *int    `json:"direction_id"`
	PatternId            *string `json:"pattern_id"`
	RouteId              *string `json:"route_id"`
	ServiceId            *string `json:"service_id"`
	ShapeId              *string `json:"shape_id"`
	TripHeadsign         *string `json:"trip_headsign"`
	TripId               *string `json:"trip_id"`
	TripShortName        *string `json:"trip_short_name"`
	WheelchairAccessible *int    `json:"wheelchair_accessible"`
	Row                  int
}

type TripGroupedByPattern map[string]struct {
	Trips []Trip
	Hash  []string
}

type TripGroupedByShapeId map[string]struct {
	Trips []Trip
	Hash  []string
}

type TripGroupedByRouteId map[string]struct {
	Trips []Trip
	Hash  []string
}

type TripGroupedByDirectionId map[string]struct {
	Trips []Trip
	Hash  []string
}

/* STOP TIME */
type StopTime struct {
	TripId                   *string  `json:"trip_id"`
	ArrivalTime              *string  `json:"arrival_time"`
	DepartureTime            *string  `json:"departure_time"`
	StopId                   *string  `json:"stop_id"`
	LocationGroupId          *string  `json:"location_group_id"`
	LocationId               *string  `json:"location_id"`
	StopSequence             *int     `json:"stop_sequence"`
	StopHeadsign             *string  `json:"stop_headsign"`
	StartPickupDropOffWindow *string  `json:"start_pickup_drop_off_window"`
	EndPickupDropOffWindow   *string  `json:"end_pickup_drop_off_window"`
	PickupType               *int     `json:"pickup_type"`
	DropOffType              *int     `json:"drop_off_type"`
	ContinuousPickup         *int     `json:"continuous_pickup"`
	ContinuousDropOff        *int     `json:"continuous_drop_off"`
	ShapeDistTraveled        *float64 `json:"shape_dist_traveled"`
	Timepoint                *int     `json:"timepoint"`
	PickupBookingRuleId      *string  `json:"pickup_booking_rule_id"`
	DropOffBookingRuleId     *string  `json:"drop_off_booking_rule_id"`
}

/* CALENDAR */
type Calendar struct {
	EndDate   string `json:"end_date"`
	Friday    bool   `json:"friday"`
	Monday    bool   `json:"monday"`
	Saturday  bool   `json:"saturday"`
	ServiceId string `json:"service_id"`
	StartDate string `json:"start_date"`
	Sunday    bool   `json:"sunday"`
	Thursday  bool   `json:"thursday"`
	Tuesday   bool   `json:"tuesday"`
	Wednesday bool   `json:"wednesday"`
}

/* CALENDAR DATES */
type CalendarDates struct {
	Date          string `json:"date"`
	ExceptionType *int   `json:"exception_type"`
	ServiceId     string `json:"service_id"`
}

/* FARE ATTRIBUTES */
type FareAttribute struct {
	FareId           *string  `json:"fare_id"`           // Identifies a fare class
	Price            *float64 `json:"price"`             // Fare price, in the unit specified by currency_type
	CurrencyType     *string  `json:"currency_type"`     // Currency used to pay the fare
	PaymentMethod    *int     `json:"payment_method"`    // When the fare must be paid (0: on board, 1: before boarding)
	Transfers        *int     `json:"transfers"`         // Number of transfers permitted (0: none, 1: once, 2: twice, empty: unlimited)
	AgencyId         *string  `json:"agency_id"`         // Agency associated with the fare (required if multiple agencies)
	TransferDuration *int     `json:"transfer_duration"` // Length of time in seconds before a transfer expires
}

/* FARE RULES */
type FareRule struct {
	FareId        *string `json:"fare_id"`        // Identifies a fare class
	RouteId       *string `json:"route_id"`       // Identifies a route associated with the fare class
	OriginId      *string `json:"origin_id"`      // Identifies an origin zone
	DestinationId *string `json:"destination_id"` // Identifies a destination zone
	ContainsId    *string `json:"contains_id"`    // Identifies zones that a rider will enter while using a given fare class
}

/* SHAPES */
type Shape struct {
	ShapeId           *string  `json:"shape_id"`
	ShapePtLat        *float32 `json:"shape_pt_lat"`
	ShapePtLon        *float32 `json:"shape_pt_lon"`
	ShapePtSequence   *int     `json:"shape_pt_sequence"`
	ShapeDistTraveled *float64 `json:"shape_dist_traveled"`
}

/* FREQUENCIES */
type Frequencies struct {
	EndTime     *string `json:"end_time"`
	ExactTimes  *int    `json:"exact_times"`
	HeadwaySecs *int    `json:"headway_secs"`
	StartTime   *string `json:"start_time"`
	TripId      *string `json:"trip_id"`
}

/* TRANSFERS */
type Transfers struct {
	FromRouteId     *string `json:"from_route_id"`
	FromStopId      *string `json:"from_stop_id"`
	FromTripId      *string `json:"from_trip_id"`
	MinTransferTime *int    `json:"min_transfer_time"`
	ToRouteId       *string `json:"to_route_id"`
	ToStopId        *string `json:"to_stop_id"`
	ToTripId        *string `json:"to_trip_id"`
	TransferType    *int    `json:"transfer_type"`
}

/* PATHWAYS */
type Pathways struct {
	FromStopId           *string  `json:"from_stop_id"`
	IsBidirectional      *int     `json:"is_bidirectional"`
	Length               *float32 `json:"length"`
	MaxSlope             *string  `json:"max_slope"`
	MinWidth             *string  `json:"min_width"`
	PathwayId            *string  `json:"pathway_id"`
	PathwayMode          *int     `json:"pathway_mode"`
	ReversedSignpostedAs *string  `json:"reversed_signposted_as"`
	SignpostedAs         *string  `json:"signposted_as"`
	StairCount           *uint16  `json:"stair_count"`
	ToStopId             *string  `json:"to_stop_id"`
	TraversalTime        *int     `json:"traversal_time"`
}

/* LEVELS */
type Levels struct {
	LevelId    *string  `json:"level_id"`
	LevelIndex *float32 `json:"level_index"`
	LevelName  *string  `json:"level_name"`
}

/* FEED INFO */
type FeedInfo struct {
	// Required fields
	FeedLang          *string `json:"feed_lang"`
	FeedPublisherName *string `json:"feed_publisher_name"`
	FeedPublisherUrl  *string `json:"feed_publisher_url"`

	// Optional fields
	DefaultLang      *string `json:"default_lang"`
	FeedContactEmail *string `json:"feed_contact_email"`
	FeedContactUrl   *string `json:"feed_contact_url"`
	FeedEndDate      *string `json:"feed_end_date"`
	FeedStartDate    *string `json:"feed_start_date"`
	FeedVersion      *string `json:"feed_version"`
}

/* TRANSLATIONS */
type Translations struct {
	FieldName   string  `json:"field_name"`
	FieldValue  *string `json:"field_value"`
	Language    string  `json:"language"`
	RecordId    *string `json:"record_id"`
	RecordSubId *string `json:"record_sub_id"`
	TableName   string  `json:"table_name"`
	Translation string  `json:"translation"`
}

/* ATTRIBUTIONS */
type Attributions struct {
	AgencyId         *string `json:"agency_id"`
	AttributionEmail *string `json:"attribution_email"`
	AttributionId    *string `json:"attribution_id"`
	AttributionPhone *string `json:"attribution_phone"`
	AttributionUrl   *string `json:"attribution_url"`
	IsAuthority      *bool   `json:"is_authority"`
	IsOperator       *bool   `json:"is_operator"`
	IsProducer       *bool   `json:"is_producer"`
	OrganizationName string  `json:"organization_name"`
	RouteId          *string `json:"route_id"`
	TripId           *string `json:"trip_id"`
}

/* TIMEFRAME */
type Timeframe struct {
	EndTime          *string `json:"end_time"`
	ServiceId        string  `json:"service_id"`
	StartTime        *string `json:"start_time"`
	TimeframeGroupId string  `json:"timeframe_group_id"`
}

/* RIDER CATEGORY*/
type RiderCategory struct {
	EligibilityUrl        *string `json:"eligibility_url"`
	IsDefaultFareCategory *int    `json:"is_default_fare_category"`
	RiderCategoryId       *string `json:"rider_category_id"`
	RiderCategoryName     *string `json:"rider_category_name"`
}

/* FARE MEDIA */
type FareMedia struct {
	FareMediaId   *string `json:"fare_media_id"`
	FareMediaName *string `json:"fare_media_name"`
	FareMediaType *int    `json:"fare_media_type"`
}

/* FARE PRODUCT */
type FareProduct struct {
	Ammount         float32 `json:"ammount"`
	Currency        string  `json:"currency"`
	FareMediaId     *string `json:"fare_media_id"`
	FareProductId   string  `json:"fare_product_id"`
	FareProductName *string `json:"fare_product_name"`
	RiderCategoryId *string `json:"rider_category_id"`
}

/* FARE LEG RULE */
type FareLegRule struct {
	FareProductId        string   `json:"fare_product_id"`
	FromAreaId           *string  `json:"from_area_id"`
	FromTimeframeGroupId *string  `json:"from_timeframe_group_id"`
	LegGroupId           *string  `json:"leg_group_id"`
	NetworkId            *string  `json:"network_id"`
	RulePriority         *float32 `json:"rule_priority"`
	ToAreaId             *string  `json:"to_area_id"`
	ToTimeframeGroupId   *string  `json:"to_timeframe_group_id"`
}

/* FARE LEG JOIN RULE */
type FareLegJoinRule struct {
	FromNetworkId string  `json:"from_network_id"`
	FromStopId    *string `json:"from_stop_id"`
	ToNetworkId   string  `json:"to_network_id"`
	ToStopId      *string `json:"to_stop_id"`
}

/* FARETRANSFERRULE */
type FareTransferRule struct {
	DurationLimit     *float32 `json:"duration_limit"`
	DurationLimitType *int     `json:"duration_limit_type"`
	FareProductId     *string  `json:"fare_product_id"`
	FareTransferType  *int     `json:"fare_transfer_type"`
	FromLegGroupId    *string  `json:"from_leg_group_id"`
	ToLegGroupId      *string  `json:"to_leg_group_id"`
	TransferCount     *float32 `json:"transfer_count"`
}

/* AREA */
type Area struct {
	AreaId   string  `json:"area_id"`
	AreaName *string `json:"area_name"`
}

/* STOPAREA */
type StopArea struct {
	AreaId string `json:"area_id"`
	StopId string `json:"stop_id"`
}

/* NETWORK */
type Network struct {
	NetworkId   string  `json:"network_id"`
	NetworkName *string `json:"network_name"`
}

/* ROUTENETWORK */
type RouteNetwork struct {
	NetworkId string `json:"network_id"`
	RouteId   string `json:"route_id"`
}

/* LOCATIONGROUP */
type LocationGroup struct {
	LocationGroupId   string  `json:"location_group_id"`
	LocationGroupName *string `json:"location_group_name"`
}

/* LOCATIONGROUPSTOP */
type LocationGroupStop struct {
	LocationGroupId string `json:"location_group_id"`
	StopId          string `json:"stop_id"`
}

/* BOOKINGRULE */
type BookingRule struct {
	BookingRuleId          string   `json:"booking_rule_id"`
	BookingType            int      `json:"booking_type"`
	BookingUrl             *string  `json:"booking_url"`
	DropOffMessage         *string  `json:"drop_off_message"`
	InfoUrl                *string  `json:"info_url"`
	Message                *string  `json:"message"`
	PhoneNumber            *string  `json:"phone_number"`
	PickupMessage          *string  `json:"pickup_message"`
	PriorNoticeDurationMax float32  `json:"prior_notice_duration_max"`
	PriorNoticeDurationMin float32  `json:"prior_notice_duration_min"`
	PriorNoticeLastDay     *float32 `json:"prior_notice_last_day"`
	PriorNoticeLastTime    *string  `json:"prior_notice_last_time"`
	PriorNoticeServiceId   *string  `json:"prior_notice_service_id"`
	PriorNoticeStartDay    *float32 `json:"prior_notice_start_day"`
	PriorNoticeStartTime   *string  `json:"prior_notice_start_time"`
}

/* ARCHIVE */
type Archive struct {
	ArchiveEndDate   string `json:"archive_end_date"`
	ArchiveId        string `json:"archive_id"`
	ArchiveStartDate string `json:"archive_start_date"`
	OperatorId       string `json:"operator_id"`
}

/* MUNICIPALITY */
type Municipality struct {
	DistrictId         string `json:"district_id"`
	DistrictName       string `json:"district_name"`
	MunicipalityId     string `json:"municipality_id"`
	MunicipalityName   string `json:"municipality_name"`
	MunicipalityPrefix string `json:"municipality_prefix"`
	RegionId           string `json:"region_id"`
	RegionName         string `json:"region_name"`
}

/* AFETACAO */
type Afetacao struct {
	AcceptedZoneCodes string  `json:"accepted_zone_codes"`
	AcceptedZoneNames string  `json:"accepted_zone_names"`
	Interchange       string  `json:"interchange"`
	LineId            string  `json:"line_id"`
	LineType          string  `json:"line_type"`
	OnboardFares      string  `json:"onboard_fares"`
	OperatorId        string  `json:"operator_id"`
	PatternId         string  `json:"pattern_id"`
	PrepaidFare       string  `json:"prepaid_fare"`
	PrepaidFarePrice  string  `json:"prepaid_fare_price"`
	StopId            string  `json:"stop_id"`
	StopName          string  `json:"stop_name"`
	StopSequence      float32 `json:"stop_sequence"`
}

/* VEHICLE */
type Vehicle struct {
	VehicleId         *string `json:"vehicle_id"`
	AgencyId          *string `json:"agency_id"`
	LicensePlate      *string `json:"license_plate"`
	Make              *string `json:"make"`
	Model             *string `json:"model"`
	Owner             *string `json:"owner"`
	RegistrationDate  *string `json:"registration_date"`
	AvailableSeats    *int    `json:"available_seats"`
	AvailableStanding *int    `json:"available_standing"`
	Typology          *string `json:"typology"`
	Propulsion        *int    `json:"propulsion"`
	Emission          *int    `json:"emission"`
	Climatization     *int    `json:"climatization"`
	Wheelchair        *int    `json:"wheelchair"`
	LoweredFloor      *int    `json:"lowered_floor"`
	Ramp              *int    `json:"ramp"`
	Kneeling          *int    `json:"kneeling"`
	StaticInformation *int    `json:"static_information"`
	OnboardMonitor    *int    `json:"onboard_monitor"`
	FrontDisplay      *int    `json:"front_display"`
	RearDisplay       *int    `json:"rear_display"`
	SideDisplay       *int    `json:"side_display"`
	InternalSound     *int    `json:"internal_sound"`
	ExternalSound     *int    `json:"external_sound"`
	ConsumptionMeter  *int    `json:"consumption_meter"`
	Bicycles          *int    `json:"bicycles"`
	PassengerCounting *int    `json:"passenger_counting"`
	VideoSurveillance *int    `json:"video_surveillance"`
}

/* PERIOD */
type Period struct {
	PeriodId   string `json:"period_id"`
	PeriodName string `json:"period_name"`
}

/* WEEKDAY */
type Weekday string

const (
	WeekdayMonday    Weekday = "monday"
	WeekdayTuesday   Weekday = "tuesday"
	WeekdayWednesday Weekday = "wednesday"
	WeekdayThursday  Weekday = "thursday"
	WeekdayFriday    Weekday = "friday"
	WeekdaySaturday  Weekday = "saturday"
	WeekdaySunday    Weekday = "sunday"
)
