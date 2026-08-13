package types

const ALL_OPTIONS = "all_options"

type Compare struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type RuleConfig struct {
	Severity Severity   `json:"severity"`
	Options  *[]string  `json:"options,omitempty"`
	Compare  *[]Compare `json:"compare,omitempty"`
}

type AgencyRules struct {
	File              Severity   `json:"_file"`
	AgencyId          RuleConfig `json:"agency_id_unique"`
	AgencyNameIdMatch RuleConfig `json:"agency_id_matched_with_agency_name"`
	AgencyName        RuleConfig `json:"agency_name_present"`
	AgencyUrl         RuleConfig `json:"agency_url_valid_url"`
	AgencyTimezone    RuleConfig `json:"agency_timezone_valid_id"`
	AgencyLang        RuleConfig `json:"agency_lang_valid_language_tag"`
	AgencyPhone       RuleConfig `json:"agency_phone_valid_phone_number"`
	AgencyFare        RuleConfig `json:"agency_fare_url_valid_url"`
	AgencyEmail       RuleConfig `json:"agency_email_valid_address"`
}

type StopsRules struct {
	File   Severity   `json:"_file"`
	StopId RuleConfig `json:"stop_id_unique"`
	// StopIdExists          RuleConfig `json:"stop_id_exists"`
	StopCode RuleConfig `json:"stop_code_valid"`
	StopName RuleConfig `json:"stop_name_required_by_location_type"`
	// StopNameMatchesData   RuleConfig `json:"stop_name_matches_stops_data"`
	StopShortName RuleConfig `json:"stop_short_name_valid"`
	TtsStopName   RuleConfig `json:"tts_stop_name_valid"`
	StopDesc      RuleConfig `json:"stop_desc_valid"`
	StopLat       RuleConfig `json:"stop_lat_valid_latitude_range"`
	// StopLatMatchesData    RuleConfig `json:"stop_lat_matches_stops_data"`
	StopLon RuleConfig `json:"stop_lon_valid_longitude_range"`
	// StopLonMatchesData    RuleConfig `json:"stop_lon_matches_stops_data"`
	ZoneId                RuleConfig `json:"zone_id_valid"`
	StopUrl               RuleConfig `json:"stop_url_valid_url"`
	LocationType          RuleConfig `json:"location_type_valid_enum"`
	ParentStation         RuleConfig `json:"parent_station_id_valid_for_stop_hierarchy"`
	StopTimezone          RuleConfig `json:"stop_timezone_valid"`
	WheelchairBoarding    RuleConfig `json:"wheelchair_boarding_valid_enum"`
	LevelId               RuleConfig `json:"level_id_valid_id"`
	PlatformCode          RuleConfig `json:"platform_code_valid"`
	PublicVisible         RuleConfig `json:"public_visible_valid_enum"`
	HasStopSign           RuleConfig `json:"has_stop_sign_valid_enum"`
	HasShelter            RuleConfig `json:"has_shelter_valid_enum"`
	ShelterCode           RuleConfig `json:"shelter_code_valid"`
	ShelterMaintainer     RuleConfig `json:"shelter_maintainer_valid"`
	HasBench              RuleConfig `json:"has_bench_valid_enum"`
	HasNetworkMap         RuleConfig `json:"has_network_map_valid_enum"`
	HasSchedules          RuleConfig `json:"has_schedules_valid_enum"`
	HasPipRealTime        RuleConfig `json:"has_pip_real_time_valid_enum"`
	HasTariffsInformation RuleConfig `json:"has_tariffs_information_valid_enum"`
	RegionId              RuleConfig `json:"region_id_valid"`
	MunicipalityId        RuleConfig `json:"municipality_id_valid"`
	ParishId              RuleConfig `json:"parish_id_valid"`
	StopAccess            RuleConfig `json:"stop_access"`
}

type RoutesRules struct {
	File              Severity   `json:"_file"`
	LineId            RuleConfig `json:"line_id_required"`
	LineShortName     RuleConfig `json:"line_short_name_present_when_line_id_present"`
	LineLongName      RuleConfig `json:"line_long_name_present_when_line_id_present"`
	RouteId           RuleConfig `json:"route_id_unique"`
	AgencyId          RuleConfig `json:"route_agency_id_references_agency_table"`
	RouteShortName    RuleConfig `json:"route_short_name_or_long_name_present"`
	RouteLongName     RuleConfig `json:"route_long_name_or_short_name_present"`
	RouteDesc         RuleConfig `json:"route_desc_per_severity_and_content_rules"`
	RouteSortOrder    RuleConfig `json:"route_sort_order_non_negative_integer"`
	RouteRemarks      RuleConfig `json:"route_remarks"`
	NetworkId         RuleConfig `json:"network_id_references_networks_table"`
	RouteType         RuleConfig `json:"route_type_valid_gtfs_enum"`
	PathType          RuleConfig `json:"path_type_valid_enum"`
	Circular          RuleConfig `json:"circular"`
	School            RuleConfig `json:"school"`
	RouteUrl          RuleConfig `json:"route_url_valid_http_url"`
	RouteColor        RuleConfig `json:"route_color_valid_hex_string"`
	RouteTextColor    RuleConfig `json:"route_text_color_valid_hex_contrast"`
	ContinuousPickup  RuleConfig `json:"continuous_pickup_valid_gtfs_enum"`
	ContinuousDropOff RuleConfig `json:"continuous_drop_off_valid_gtfs_enum"`
}

type TripsRules struct {
	File                                      Severity   `json:"_file"`
	RouteId                                   RuleConfig `json:"route_id_references_routes_table"`
	PatternId                                 RuleConfig `json:"pattern_id_present_and_references_consistent"`
	ServiceId                                 RuleConfig `json:"service_id_references_calendar_service"`
	TripId                                    RuleConfig `json:"trip_id_unique"`
	TripHeadsign                              RuleConfig `json:"trip_headsign_present_when_short_name_absent"`
	TripShortName                             RuleConfig `json:"trip_short_name_exclusivity"`
	DirectionId                               RuleConfig `json:"direction_id_valid_enum"`
	BlockId                                   RuleConfig `json:"block_id_in_allowed_set"`
	ShapeId                                   RuleConfig `json:"shape_id_references_shapes_table_when_present"`
	WheelchairAccessible                      RuleConfig `json:"wheelchair_accessible_valid_gtfs_enum"`
	BikesAllowed                              RuleConfig `json:"bikes_allowed_valid_gtfs_enum"`
	StopSequence                              RuleConfig `json:"stop_sequence_increasing_by_one_along_trip"`
	DirectionPatternIdMatch                   RuleConfig `json:"direction_id_matches_feed_pattern_direction"`
	TripIdLimitCharacters                     RuleConfig `json:"trip_id_limit_max_length"`
	PatternIdFormat                           RuleConfig `json:"pattern_id_matches_feed_pattern_id_syntax"`
	StopCoordinatesByTripId                   RuleConfig `json:"trip_path_stop_coordinates_referenced_from_stops"`
	PatternIdTripHasRequiredFieldsForGrouping RuleConfig `json:"pattern_id_trip_has_required_fields_for_grouping"`
	PatternIdSingleTripSignaturePerPattern    RuleConfig `json:"pattern_id_single_trip_signature_per_pattern"`
	RouteIdGroup                              RuleConfig `json:"route_id_consistent_for_all_patterns_in_trips"`
	DirectionIdGroup                          RuleConfig `json:"direction_id_consistent_for_all_patterns_in_trips"`
	OneShapeIdPerPatternIdGroup               RuleConfig `json:"one_shape_id_per_pattern_id_group"`
	OnePatternIdPerShapeIdGroup               RuleConfig `json:"one_pattern_id_per_shape_id_group"`
	TripHeadsignGroup                         RuleConfig `json:"trip_headsign_consistent_for_all_patterns_in_trips"`
	ShapeIdSamePatternId                      RuleConfig `json:"shape_id_needs_to_be_the_same_as_pattern_id"`
}

type StopTimesRules struct {
	File                     Severity   `json:"_file"`
	TripId                   RuleConfig `json:"stop_times_trip_id_references_trips_table"`
	ArrivalTime              RuleConfig `json:"arrival_time_ordering_with_departure_and_frequencies"`
	DepartureTime            RuleConfig `json:"departure_time_ordering_with_arrival_and_timepoint"`
	ArrivalDepartureSequence RuleConfig `json:"arrival_departure_time_non_decreasing_by_stop_sequence"`
	StopId                   RuleConfig `json:"stop_times_stop_id_references_stops_table"`
	StopHeadsign             RuleConfig `json:"stop_headsign_present"`
	PickupType               RuleConfig `json:"pickup_type_valid_gtfs_enum"`
	DropOffType              RuleConfig `json:"drop_off_type_valid_gtfs_enum"`
	ContinuousPickup         RuleConfig `json:"stop_times_continuous_pickup_valid_gtfs_enum"`
	ContinuousDropOff        RuleConfig `json:"stop_times_continuous_drop_off_valid_gtfs_enum"`
	ShapeDistTraveled        RuleConfig `json:"stop_times_shape_dist_traveled_non_decreasing_on_trip"`
	StartPickupDropOffWindow RuleConfig `json:"start_pickup_drop_off_window_valid"`
	EndPickupDropOffWindow   RuleConfig `json:"end_pickup_drop_off_window_valid"`
	Timepoint                RuleConfig `json:"timepoint_valid_gtfs_enum"`
	PickupBookingRuleId      RuleConfig `json:"pickup_booking_rule_id_references_booking_rules"`
	DropOffBookingRuleId     RuleConfig `json:"drop_off_booking_rule_id_references_booking_rules_or_empty"`
	LocationGroupId          RuleConfig `json:"location_group_id_consistent_with_trip_id_and_stops"`
}

type CalendarRules struct {
	File      Severity   `json:"_file"`
	ServiceId RuleConfig `json:"calendar_service_id_unique_non_empty"`
	Monday    RuleConfig `json:"monday"`
	Tuesday   RuleConfig `json:"tuesday"`
	Wednesday RuleConfig `json:"wednesday"`
	Thursday  RuleConfig `json:"thursday"`
	Friday    RuleConfig `json:"friday"`
	Saturday  RuleConfig `json:"saturday"`
	Sunday    RuleConfig `json:"sunday"`
	StartDate RuleConfig `json:"calendar_start_date_valid_yyyymmdd"`
	EndDate   RuleConfig `json:"calendar_end_date_valid_yyyymmdd"`
}

type CalendarDatesRules struct {
	File          Severity   `json:"_file"`
	ServiceId     RuleConfig `json:"calendar_dates_service_id_references_calendar"`
	Date          RuleConfig `json:"exception_date_valid_yyyymmdd"`
	ExceptionType RuleConfig `json:"exception_type_add_or_remove_service"`
	DayType       RuleConfig `json:"day_type"`
	Holiday       RuleConfig `json:"holiday"`
	Period        RuleConfig `json:"period"`
}

type VehiclesRules struct {
	File              Severity   `json:"_file"`
	VehicleId         RuleConfig `json:"vehicle_id_unique"`
	AgencyId          RuleConfig `json:"vehicle_agency_id_references_agency_table"`
	LicensePlate      RuleConfig `json:"license_plate_format_per_market_rules"`
	Make              RuleConfig `json:"vehicle_make_required"`
	Model             RuleConfig `json:"vehicle_model_required"`
	Owner             RuleConfig `json:"vehicle_owner_required"`
	RegistrationDate  RuleConfig `json:"registration_date_valid_day_granularity"`
	AvailableSeats    RuleConfig `json:"available_seats_non_negative"`
	AvailableStanding RuleConfig `json:"available_standing_non_negative"`
	Typology          RuleConfig `json:"typology_in_allowed_vehicle_types"`
	Propulsion        RuleConfig `json:"propulsion_type_valid_enum"`
	Emission          RuleConfig `json:"emission_code_valid_for_propulsion_type"`
	Climatization     RuleConfig `json:"climatization_valid_enum"`
	Wheelchair        RuleConfig `json:"wheelchair_spots_valid_enum"`
	LoweredFloor      RuleConfig `json:"lowered_floor_valid_enum"`
	Ramp              RuleConfig `json:"ramp_valid_enum"`
	Kneeling          RuleConfig `json:"kneeling_valid_enum"`
	StaticInformation RuleConfig `json:"static_information_valid_enum"`
	OnboardMonitor    RuleConfig `json:"onboard_monitor_valid_enum"`
	FrontDisplay      RuleConfig `json:"front_display_valid_enum"`
	RearDisplay       RuleConfig `json:"rear_display_valid_enum"`
	SideDisplay       RuleConfig `json:"side_display_valid_enum"`
	InternalSound     RuleConfig `json:"internal_sound_level_valid_enum"`
	ExternalSound     RuleConfig `json:"external_sound_valid_enum"`
	ConsumptionMeter  RuleConfig `json:"consumption_meter_valid_format"`
	Bicycles          RuleConfig `json:"bicycles_rack_count_non_negative"`
	PassengerCounting RuleConfig `json:"passenger_counting_valid_enum"`
	VideoSurveillance RuleConfig `json:"video_surveillance_valid_enum"`
}

type FareAttributesRules struct {
	File             Severity   `json:"_file"`
	FareId           RuleConfig `json:"fare_id_unique"`
	Price            RuleConfig `json:"fare_price_valid_non_negative_decimal"`
	CurrencyType     RuleConfig `json:"currency_type_valid"`
	PaymentMethod    RuleConfig `json:"payment_method_valid_gtfs_enum"`
	Transfers        RuleConfig `json:"transfers_valid_gtfs_enum"`
	AgencyId         RuleConfig `json:"fare_attributes_agency_id_references_agency_table"`
	TransferDuration RuleConfig `json:"transfer_duration_valid_seconds_range"`
}

type FareRulesRules struct {
	File          Severity   `json:"_file"`
	FareId        RuleConfig `json:"fare_rule_fare_id_references_fare_attributes"`
	RouteId       RuleConfig `json:"fare_rule_route_id_references_routes"`
	OriginId      RuleConfig `json:"fare_rule_origin_id_references_zones_stops"`
	DestinationId RuleConfig `json:"fare_rule_destination_id_references_zones_stops"`
	ContainsId    RuleConfig `json:"fare_rule_contains_id_references_zones_stops"`
}

type FareMediaRules struct {
	File          Severity   `json:"_file"`
	FareMediaId   RuleConfig `json:"fare_media_id_unique"`
	FareMediaName RuleConfig `json:"fare_media_name_non_empty"`
	FareMediaType RuleConfig `json:"fare_media_type_valid"`
}

type ShapesRules struct {
	File                                           Severity   `json:"_file"`
	ShapeId                                        RuleConfig `json:"shape_id_required"`
	ShapePtLat                                     RuleConfig `json:"shape_pt_lat_valid_latitude"`
	ShapePtLon                                     RuleConfig `json:"shape_pt_lon_valid_longitude"`
	ShapePtSequence                                RuleConfig `json:"shape_pt_sequence_not_repeated_within_shape"`
	ShapeDistTraveled                              RuleConfig `json:"shape_dist_traveled_non_negative_monotonic"`
	ShapeIdAndPointSequenceRequired                RuleConfig `json:"shape_id_and_point_sequence_required"`
	ShapePtSequenceStrictlyIncreasing              RuleConfig `json:"shape_pt_sequence_strictly_increasing"`
	ShapeDistTraveledNonDecreasingWithSequence     RuleConfig `json:"shape_dist_traveled_non_decreasing_with_sequence"`
	ShapePointsCoordinatesConsistent               RuleConfig `json:"shape_sequence_position_mismatches_cumulative_traveled_distance"`
	ShapePointsCoordinatesDistances                RuleConfig `json:"shape_dist_traveled_delta_mismatches_haversine_segment"`
	ShapeBlockDistanceRowsAggregated               RuleConfig `json:"shape_block_distance_rows_aggregated"`
	ShapeDistTraveledDeltaMismatchesHaversineBlock RuleConfig `json:"shape_dist_traveled_delta_mismatches_haversine_block"`
}

type FrequenciesRules struct {
	File        Severity   `json:"_file"`
	TripId      RuleConfig `json:"trip_id"`
	StartTime   RuleConfig `json:"start_time"`
	EndTime     RuleConfig `json:"end_time"`
	HeadwaySecs RuleConfig `json:"headway_secs"`
	ExactTimes  RuleConfig `json:"exact_times"`
}

type TransfersRules struct {
	File            Severity   `json:"_file"`
	FromStopId      RuleConfig `json:"transfer_from_stop_id_references_stops_table"`
	FromRouteId     RuleConfig `json:"transfer_from_route_id_references_routes_table"`
	FromTripId      RuleConfig `json:"transfer_from_trip_id_references_trips_table"`
	ToRouteId       RuleConfig `json:"transfer_to_route_id_references_routes_table"`
	ToStopId        RuleConfig `json:"transfer_to_stop_id_references_stops_table"`
	ToTripId        RuleConfig `json:"transfer_to_trip_id_references_trips_table"`
	TransferType    RuleConfig `json:"transfer_type_valid_gtfs_enum"`
	MinTransferTime RuleConfig `json:"min_transfer_time_non_negative_seconds"`
}

type PathwaysRules struct {
	File                 Severity   `json:"_file"`
	PathwayId            RuleConfig `json:"pathway_id_unique"`
	FromStopId           RuleConfig `json:"pathway_from_stop_id_references_stops_table"`
	ToStopId             RuleConfig `json:"pathway_to_stop_id_references_stops_table"`
	PathwayMode          RuleConfig `json:"pathway_mode_valid_gtfs_enum"`
	IsBidirectional      RuleConfig `json:"pathway_is_bidirectional_valid_gtfs_enum"`
	Length               RuleConfig `json:"pathway_length_non_negative"`
	TraversalTime        RuleConfig `json:"pathway_traversal_time_non_negative_seconds"`
	StairCount           RuleConfig `json:"pathway_stair_count"`
	MaxSlope             RuleConfig `json:"pathway_max_slope_allowed_for_pathway_mode"`
	MinWidth             RuleConfig `json:"pathway_min_width_positive"`
	SignpostedAs         RuleConfig `json:"pathway_signposted_as"`
	ReversedSignpostedAs RuleConfig `json:"pathway_reversed_signposted_as"`
}

type LevelsRules struct {
	File       Severity   `json:"_file"`
	LevelId    RuleConfig `json:"level_id_unique"`
	LevelIndex RuleConfig `json:"level_index_required"`
	LevelName  RuleConfig `json:"level_name"`
}

type FeedInfoRules struct {
	File              Severity   `json:"_file"`
	FeedType          RuleConfig `json:"feed_type"`
	FeedPublisherName RuleConfig `json:"feed_publisher_name_non_empty"`
	FeedPublisherUrl  RuleConfig `json:"feed_publisher_url_valid_http_url"`
	FeedLang          RuleConfig `json:"feed_lang_valid_tag"`
	DefaultLang       RuleConfig `json:"default_lang_matches_feed_lang_when_present"`
	FeedStartDate     RuleConfig `json:"feed_start_date_valid_yyyymmdd"`
	FeedEndDate       RuleConfig `json:"feed_end_date_valid_yyyymmdd_not_before_start"`
	FeedVersion       RuleConfig `json:"feed_version_valid_identifier"`
	FeedRemarks       RuleConfig `json:"feed_remarks"`
	FeedContactEmail  RuleConfig `json:"feed_contact_email_valid_address"`
	FeedContactUrl    RuleConfig `json:"feed_contact_url_valid_http_url"`
}

type TranslationsRules struct {
	File        Severity   `json:"_file"`
	TableName   RuleConfig `json:"table_name"`
	FieldName   RuleConfig `json:"field_name"`
	Language    RuleConfig `json:"language"`
	Translation RuleConfig `json:"translation"`
	RecordId    RuleConfig `json:"record_id"`
	RecordSubId RuleConfig `json:"record_sub_id"`
	FieldValue  RuleConfig `json:"field_value"`
}

type AttributionsRules struct {
	File             Severity   `json:"_file"`
	AttributionId    RuleConfig `json:"attribution_id"`
	AgencyId         RuleConfig `json:"agency_id"`
	RouteId          RuleConfig `json:"route_id"`
	TripId           RuleConfig `json:"trip_id"`
	OrganizationName RuleConfig `json:"organization_name"`
	IsProducer       RuleConfig `json:"is_producer"`
	IsOperator       RuleConfig `json:"is_operator"`
	IsAuthority      RuleConfig `json:"is_authority"`
	AttributionUrl   RuleConfig `json:"attribution_url"`
	AttributionEmail RuleConfig `json:"attribution_email"`
	AttributionPhone RuleConfig `json:"attribution_phone"`
}

type RiderCategoriesRules struct {
	File                  Severity   `json:"_file"`
	RiderCategoryId       RuleConfig `json:"rider_category_id_unique"`
	RiderCategoryName     RuleConfig `json:"rider_category_name_non_empty"`
	IsDefaultFareCategory RuleConfig `json:"at_most_one_default_fare_category"`
	EligibilityUrl        RuleConfig `json:"eligibility_url_valid_http_url"`
}

// RuleIDGtfsFeedFilePresenceAndIntegrity is the rule_id emitted by validations/files.
const RuleIDGtfsFeedFilePresenceAndIntegrity = "gtfs_feed_file_presence_and_integrity_rule"

// RuleIDFeedInfoValuesParse is the rule_id for feed_info row parsing errors.
const RuleIDFeedInfoValuesParse = "feed_info_values_parse"

type FileValidationRules struct {
	File                             Severity   `json:"_file"`
	GtfsFeedFilePresenceAndIntegrity RuleConfig `json:"gtfs_feed_file_presence_and_integrity_rule"`
}

type GtfsRules struct {
	Agency          AgencyRules          `json:"agency"`
	FileValidation  FileValidationRules  `json:"file_validation"`
	RiderCategories RiderCategoriesRules `json:"rider_categories"`
	Stops           StopsRules           `json:"stops"`
	Routes          RoutesRules          `json:"routes"`
	Trips           TripsRules           `json:"trips"`
	StopTimes       StopTimesRules       `json:"stop_times"`
	Calendar        CalendarRules        `json:"calendar"`
	CalendarDates   CalendarDatesRules   `json:"calendar_dates"`
	Vehicles        VehiclesRules        `json:"vehicles"`
	FareAttributes  FareAttributesRules  `json:"fare_attributes"`
	FareRules       FareRulesRules       `json:"fare_rules"`
	Shapes          ShapesRules          `json:"shapes"`
	Frequencies     FrequenciesRules     `json:"frequencies"`
	Transfers       TransfersRules       `json:"transfers"`
	Pathways        PathwaysRules        `json:"pathways"`
	Levels          LevelsRules          `json:"levels"`
	FeedInfo        FeedInfoRules        `json:"feed_info"`
	Translations    TranslationsRules    `json:"translations"`
	Attributions    AttributionsRules    `json:"attributions"`
	FareMedia       FareMediaRules       `json:"fare_media"`
}
