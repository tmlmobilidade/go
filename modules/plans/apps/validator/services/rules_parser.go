package services

import (
	"encoding/json"
	"fmt"
	"io"
	"main/lib"
	"main/types"
	"os"
	"reflect"
)

// RulesParser handles parsing of GTFS validation rules from JSON files
type RulesParser struct {
	rulesPath string
}

// NewRulesParser creates a new rules parser with the specified rules file path
func NewRulesParser(rulesPath string) *RulesParser {
	return &RulesParser{
		rulesPath: rulesPath,
	}
}

// ParseRules reads and parses the rules JSON file into a GtfsRules structure
func (rp *RulesParser) ParseRules() (*types.GtfsRules, error) {
	if rp.rulesPath == "" {
		return nil, nil
	}

	// Check if file exists
	if _, err := os.Stat(rp.rulesPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("rules file does not exist: %s", rp.rulesPath)
	}

	// Open and read the file
	file, err := os.Open(rp.rulesPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open rules file: %w", err)
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("failed to read rules file: %w", err)
	}

	// Parse JSON into GtfsRules structure
	var rules types.GtfsRules
	if err := json.Unmarshal(data, &rules); err != nil {
		return nil, fmt.Errorf("failed to parse rules JSON: %w", err)
	}

	// Validate the parsed rules
	if err := rp.validateRules(&rules); err != nil {
		return nil, fmt.Errorf("rules validation failed: %w", err)
	}

	lib.AppLogger.Info(fmt.Sprintf("Successfully parsed rules from: %s", rp.rulesPath))
	return &rules, nil
}

// validateRules performs validation on the parsed rules to ensure they are correct
func (rp *RulesParser) validateRules(rules *types.GtfsRules) error {
	// Validate severity values across all rule configurations
	validationErrors := []string{}

	// Helper function to validate a single rule config
	validateRuleConfig := func(config types.RuleConfig, fieldName string) {
		if !isValidSeverity(config.Severity) {
			validationErrors = append(validationErrors, fmt.Sprintf("Invalid severity '%s' for field '%s'", config.Severity, fieldName))
		}
	}

	// Validate agency rules
	if rules.Agency.File != types.SEVERITY_FORBIDDEN {
		validateRuleConfig(rules.Agency.AgencyId, "agency.agency_id_unique")
		validateRuleConfig(rules.Agency.AgencyNameIdMatch, "agency.agency_id_matched_with_agency_name")
		validateRuleConfig(rules.Agency.AgencyName, "agency.agency_name_present")
		validateRuleConfig(rules.Agency.AgencyUrl, "agency.agency_url_valid_url")
		validateRuleConfig(rules.Agency.AgencyTimezone, "agency.agency_timezone_valid_id")
		validateRuleConfig(rules.Agency.AgencyLang, "agency.agency_lang_valid_language_tag")
		validateRuleConfig(rules.Agency.AgencyPhone, "agency.agency_phone_valid_phone_number")
		validateRuleConfig(rules.Agency.AgencyFare, "agency.agency_fare_url_valid_url")
		validateRuleConfig(rules.Agency.AgencyEmail, "agency.agency_email_valid_address")
	}

	if rules.FileValidation.File != types.SEVERITY_FORBIDDEN && rules.FileValidation.File != "" {
		validateRuleConfig(rules.FileValidation.GtfsFeedFilePresenceAndIntegrity, "file_validation.gtfs_feed_file_presence_and_integrity_rule")
	}

	// Validate rider_categories rules
	if rules.RiderCategories.File != types.SEVERITY_FORBIDDEN {
		validateRuleConfig(rules.RiderCategories.RiderCategoryId, "rider_categories.rider_category_id_unique")
		validateRuleConfig(rules.RiderCategories.RiderCategoryName, "rider_categories.rider_category_name_non_empty")
		validateRuleConfig(rules.RiderCategories.IsDefaultFareCategory, "rider_categories.at_most_one_default_fare_category")
		validateRuleConfig(rules.RiderCategories.EligibilityUrl, "rider_categories.eligibility_url_valid_http_url")
	}

	// Validate stops rules
	if rules.Stops.File != types.SEVERITY_FORBIDDEN {
		validateRuleConfig(rules.Stops.StopId, "stops.stop_id_unique")
		validateRuleConfig(rules.Stops.StopCode, "stops.stop_code_valid")
		validateRuleConfig(rules.Stops.StopName, "stops.stop_name_required_by_location_type")
		validateRuleConfig(rules.Stops.StopShortName, "stops.stop_short_name_valid")
		validateRuleConfig(rules.Stops.TtsStopName, "stops.tts_stop_name_valid")
		validateRuleConfig(rules.Stops.StopDesc, "stops.stop_desc_valid")
		validateRuleConfig(rules.Stops.StopLat, "stops.stop_lat_valid_latitude_range")
		validateRuleConfig(rules.Stops.StopLon, "stops.stop_lon_valid_longitude_range")
		validateRuleConfig(rules.Stops.ZoneId, "stops.zone_id_valid")
		validateRuleConfig(rules.Stops.StopUrl, "stops.stop_url_valid_url")
		validateRuleConfig(rules.Stops.LocationType, "stops.location_type_valid_enum")
		validateRuleConfig(rules.Stops.ParentStation, "stops.parent_station_id_valid_for_stop_hierarchy")
		validateRuleConfig(rules.Stops.StopTimezone, "stops.stop_timezone_valid")
		validateRuleConfig(rules.Stops.WheelchairBoarding, "stops.wheelchair_boarding_valid_enum")
		validateRuleConfig(rules.Stops.LevelId, "stops.level_id_valid_id")
		validateRuleConfig(rules.Stops.PlatformCode, "stops.platform_code_valid")
		validateRuleConfig(rules.Stops.PublicVisible, "stops.public_visible_valid_enum")
		validateRuleConfig(rules.Stops.HasStopSign, "stops.has_stop_sign_valid_enum")
		validateRuleConfig(rules.Stops.HasShelter, "stops.has_shelter_valid_enum")
		validateRuleConfig(rules.Stops.ShelterCode, "stops.shelter_code_valid")
		validateRuleConfig(rules.Stops.ShelterMaintainer, "stops.shelter_maintainer_valid")
		validateRuleConfig(rules.Stops.HasBench, "stops.has_bench_valid_enum")
		validateRuleConfig(rules.Stops.HasNetworkMap, "stops.has_network_map_valid_enum")
		validateRuleConfig(rules.Stops.HasSchedules, "stops.has_schedules_valid_enum")
		validateRuleConfig(rules.Stops.HasPipRealTime, "stops.has_pip_real_time_valid_enum")
		validateRuleConfig(rules.Stops.HasTariffsInformation, "stops.has_tariffs_information_valid_enum")
		validateRuleConfig(rules.Stops.RegionId, "stops.region_id_valid")
		validateRuleConfig(rules.Stops.MunicipalityId, "stops.municipality_id_valid")
		validateRuleConfig(rules.Stops.ParishId, "stops.parish_id_valid")
	}

	// Validate routes rules
	if rules.Routes.File != types.SEVERITY_FORBIDDEN {
		validateRuleConfig(rules.Routes.LineId, "routes.line_id_required")
		validateRuleConfig(rules.Routes.LineShortName, "routes.line_short_name_present_when_line_id_present")
		validateRuleConfig(rules.Routes.LineLongName, "routes.line_long_name_present_when_line_id_present")
		validateRuleConfig(rules.Routes.RouteId, "routes.route_id_unique")
		validateRuleConfig(rules.Routes.AgencyId, "routes.route_agency_id_references_agency_table")
		validateRuleConfig(rules.Routes.RouteShortName, "routes.route_short_name_or_long_name_present")
		validateRuleConfig(rules.Routes.RouteLongName, "routes.route_long_name_or_short_name_present")
		validateRuleConfig(rules.Routes.RouteDesc, "routes.route_desc_per_severity_and_content_rules")
		validateRuleConfig(rules.Routes.RouteSortOrder, "routes.route_sort_order_non_negative_integer")
		validateRuleConfig(rules.Routes.RouteRemarks, "routes.route_remarks")
		validateRuleConfig(rules.Routes.NetworkId, "routes.network_id_references_networks_table")
		validateRuleConfig(rules.Routes.RouteType, "routes.route_type_valid_gtfs_enum")
		validateRuleConfig(rules.Routes.PathType, "routes.path_type_valid_enum")
		validateRuleConfig(rules.Routes.Circular, "routes.circular")
		validateRuleConfig(rules.Routes.School, "routes.school")
		validateRuleConfig(rules.Routes.RouteUrl, "routes.route_url_valid_http_url")
		validateRuleConfig(rules.Routes.RouteColor, "routes.route_color_valid_hex_string")
		validateRuleConfig(rules.Routes.RouteTextColor, "routes.route_text_color_valid_hex_contrast")
		validateRuleConfig(rules.Routes.ContinuousPickup, "routes.continuous_pickup_valid_gtfs_enum")
		validateRuleConfig(rules.Routes.ContinuousDropOff, "routes.continuous_drop_off_valid_gtfs_enum")
	}

	// Add validation for other rule types (trips, stop_times, calendar, etc.)
	if rules.Trips.File != types.SEVERITY_FORBIDDEN {
		validateRuleConfig(rules.Trips.RouteId, "trips.route_id_references_routes_table")
		validateRuleConfig(rules.Trips.PatternId, "trips.pattern_id_present_and_references_consistent")
		validateRuleConfig(rules.Trips.ServiceId, "trips.service_id_references_calendar_service")
		validateRuleConfig(rules.Trips.TripId, "trips.trip_id_unique")
		validateRuleConfig(rules.Trips.TripHeadsign, "trips.trip_headsign_present_when_short_name_absent")
		validateRuleConfig(rules.Trips.TripShortName, "trips.trip_short_name_exclusivity")
		validateRuleConfig(rules.Trips.DirectionId, "trips.direction_id_valid_enum")
		validateRuleConfig(rules.Trips.BlockId, "trips.block_id_in_allowed_set")
		validateRuleConfig(rules.Trips.ShapeId, "trips.shape_id_references_shapes_table_when_present")
		validateRuleConfig(rules.Trips.WheelchairAccessible, "trips.wheelchair_accessible_valid_gtfs_enum")
		validateRuleConfig(rules.Trips.BikesAllowed, "trips.bikes_allowed_valid_gtfs_enum")
		validateRuleConfig(rules.Trips.StopSequence, "trips.stop_sequence_increasing_by_one_along_trip")
		validateRuleConfig(rules.Trips.DirectionPatternIdMatch, "trips.direction_id_matches_feed_pattern_direction")
		validateRuleConfig(rules.Trips.TripIdLimitCharacters, "trips.trip_id_limit_max_length")
		validateRuleConfig(rules.Trips.PatternIdFormat, "trips.pattern_id_matches_feed_pattern_id_syntax")
		validateRuleConfig(rules.Trips.StopCoordinatesByTripId, "trips.trip_path_stop_coordinates_referenced_from_stops")
		validateRuleConfig(rules.Trips.PatternIdTripHasRequiredFieldsForGrouping, "trips.pattern_id_trip_has_required_fields_for_grouping")
		validateRuleConfig(rules.Trips.PatternIdSingleTripSignaturePerPattern, "trips.pattern_id_single_trip_signature_per_pattern")
		validateRuleConfig(rules.Trips.RouteIdGroup, "trips.route_id_consistent_for_all_patterns_in_trips")
		validateRuleConfig(rules.Trips.DirectionIdGroup, "trips.direction_id_consistent_for_all_patterns_in_trips")
		validateRuleConfig(rules.Trips.OneShapeIdPerPatternIdGroup, "trips.one_shape_id_per_pattern_id_group")
		validateRuleConfig(rules.Trips.OnePatternIdPerShapeIdGroup, "trips.one_pattern_id_per_shape_id_group")
		validateRuleConfig(rules.Trips.TripHeadsignGroup, "trips.trip_headsign_consistent_for_all_patterns_in_trips")
		validateRuleConfig(rules.Trips.ShapeIdSamePatternId, "trips.shape_id_needs_to_be_the_same_as_pattern_id")
	}

	if rules.StopTimes.File != types.SEVERITY_FORBIDDEN {
		validateRuleConfig(rules.StopTimes.TripId, "stop_times.stop_times_trip_id_references_trips_table")
		validateRuleConfig(rules.StopTimes.ArrivalTime, "stop_times.arrival_time_ordering_with_departure_and_frequencies")
		validateRuleConfig(rules.StopTimes.DepartureTime, "stop_times.departure_time_ordering_with_arrival_and_timepoint")
		validateRuleConfig(rules.StopTimes.ArrivalDepartureSequence, "stop_times.arrival_departure_time_non_decreasing_by_stop_sequence")
		validateRuleConfig(rules.StopTimes.StopId, "stop_times.stop_times_stop_id_references_stops_table")
		validateRuleConfig(rules.StopTimes.StopHeadsign, "stop_times.stop_headsign_present")
		validateRuleConfig(rules.StopTimes.PickupType, "stop_times.pickup_type_valid_gtfs_enum")
		validateRuleConfig(rules.StopTimes.DropOffType, "stop_times.drop_off_type_valid_gtfs_enum")
		validateRuleConfig(rules.StopTimes.ContinuousPickup, "stop_times.stop_times_continuous_pickup_valid_gtfs_enum")
		validateRuleConfig(rules.StopTimes.ContinuousDropOff, "stop_times.stop_times_continuous_drop_off_valid_gtfs_enum")
		validateRuleConfig(rules.StopTimes.ShapeDistTraveled, "stop_times.stop_times_shape_dist_traveled_non_decreasing_on_trip")
		validateRuleConfig(rules.StopTimes.StartPickupDropOffWindow, "stop_times.start_pickup_drop_off_window_valid")
		validateRuleConfig(rules.StopTimes.EndPickupDropOffWindow, "stop_times.end_pickup_drop_off_window_valid")
		validateRuleConfig(rules.StopTimes.Timepoint, "stop_times.timepoint_valid_gtfs_enum")
		validateRuleConfig(rules.StopTimes.PickupBookingRuleId, "stop_times.pickup_booking_rule_id_references_booking_rules")
		validateRuleConfig(rules.StopTimes.DropOffBookingRuleId, "stop_times.drop_off_booking_rule_id_references_booking_rules_or_empty")
		validateRuleConfig(rules.StopTimes.LocationGroupId, "stop_times.location_group_id_consistent_with_trip_id_and_stops")
	}

	if rules.Shapes.File != types.SEVERITY_FORBIDDEN {
		validateRuleConfig(rules.Shapes.ShapeId, "shapes.shape_id_required")
		validateRuleConfig(rules.Shapes.ShapePtLat, "shapes.shape_pt_lat_valid_latitude")
		validateRuleConfig(rules.Shapes.ShapePtLon, "shapes.shape_pt_lon_valid_longitude")
		validateRuleConfig(rules.Shapes.ShapePtSequence, "shapes.shape_pt_sequence_not_repeated_within_shape")
		validateRuleConfig(rules.Shapes.ShapeDistTraveled, "shapes.shape_dist_traveled_non_negative_monotonic")
		validateRuleConfig(rules.Shapes.ShapeIdAndPointSequenceRequired, "shapes.shape_id_and_point_sequence_required")
		validateRuleConfig(rules.Shapes.ShapePtSequenceStrictlyIncreasing, "shapes.shape_pt_sequence_strictly_increasing")
		validateRuleConfig(rules.Shapes.ShapeDistTraveledNonDecreasingWithSequence, "shapes.shape_dist_traveled_non_decreasing_with_sequence")
		validateRuleConfig(rules.Shapes.ShapePointsCoordinatesConsistent, "shapes.shape_sequence_position_mismatches_cumulative_traveled_distance")
		validateRuleConfig(rules.Shapes.ShapePointsCoordinatesDistances, "shapes.shape_dist_traveled_delta_mismatches_haversine_segment")
		validateRuleConfig(rules.Shapes.ShapeBlockDistanceRowsAggregated, "shapes.shape_block_distance_rows_aggregated")
		validateRuleConfig(rules.Shapes.ShapeDistTraveledDeltaMismatchesHaversineBlock, "shapes.shape_dist_traveled_delta_mismatches_haversine_block")
	}

	if rules.Calendar.File != types.SEVERITY_FORBIDDEN {
		validateRuleConfig(rules.Calendar.ServiceId, "calendar.calendar_service_id_unique_non_empty")
		validateRuleConfig(rules.Calendar.Monday, "calendar.monday")
		validateRuleConfig(rules.Calendar.Tuesday, "calendar.tuesday")
		validateRuleConfig(rules.Calendar.Wednesday, "calendar.wednesday")
		validateRuleConfig(rules.Calendar.Thursday, "calendar.thursday")
		validateRuleConfig(rules.Calendar.Friday, "calendar.friday")
		validateRuleConfig(rules.Calendar.Saturday, "calendar.saturday")
		validateRuleConfig(rules.Calendar.Sunday, "calendar.sunday")
		validateRuleConfig(rules.Calendar.StartDate, "calendar.calendar_start_date_valid_yyyymmdd")
		validateRuleConfig(rules.Calendar.EndDate, "calendar.calendar_end_date_valid_yyyymmdd")
	}

	if rules.CalendarDates.File != types.SEVERITY_FORBIDDEN {
		validateRuleConfig(rules.CalendarDates.ServiceId, "calendar_dates.calendar_dates_service_id_references_calendar")
		validateRuleConfig(rules.CalendarDates.Date, "calendar_dates.exception_date_valid_yyyymmdd")
		validateRuleConfig(rules.CalendarDates.ExceptionType, "calendar_dates.exception_type_add_or_remove_service")
		validateRuleConfig(rules.CalendarDates.DayType, "calendar_dates.day_type")
		validateRuleConfig(rules.CalendarDates.Holiday, "calendar_dates.holiday")
		validateRuleConfig(rules.CalendarDates.Period, "calendar_dates.period")
	}

	if rules.FeedInfo.File != types.SEVERITY_FORBIDDEN {
		validateRuleConfig(rules.FeedInfo.FeedType, "feed_info.feed_type")
		validateRuleConfig(rules.FeedInfo.FeedPublisherName, "feed_info.feed_publisher_name_non_empty")
		validateRuleConfig(rules.FeedInfo.FeedPublisherUrl, "feed_info.feed_publisher_url_valid_http_url")
		validateRuleConfig(rules.FeedInfo.FeedLang, "feed_info.feed_lang_valid_tag")
		validateRuleConfig(rules.FeedInfo.DefaultLang, "feed_info.default_lang_matches_feed_lang_when_present")
		validateRuleConfig(rules.FeedInfo.FeedStartDate, "feed_info.feed_start_date_valid_yyyymmdd")
		validateRuleConfig(rules.FeedInfo.FeedEndDate, "feed_info.feed_end_date_valid_yyyymmdd_not_before_start")
		validateRuleConfig(rules.FeedInfo.FeedVersion, "feed_info.feed_version_valid_identifier")
		validateRuleConfig(rules.FeedInfo.FeedRemarks, "feed_info.feed_remarks")
		validateRuleConfig(rules.FeedInfo.FeedContactEmail, "feed_info.feed_contact_email_valid_address")
		validateRuleConfig(rules.FeedInfo.FeedContactUrl, "feed_info.feed_contact_url_valid_http_url")
	}

	if rules.FareAttributes.File != types.SEVERITY_FORBIDDEN {
		validateRuleConfig(rules.FareAttributes.FareId, "fare_attributes.fare_id_unique")
		validateRuleConfig(rules.FareAttributes.Price, "fare_attributes.fare_price_valid_non_negative_decimal")
		validateRuleConfig(rules.FareAttributes.CurrencyType, "fare_attributes.currency_type_valid")
		validateRuleConfig(rules.FareAttributes.PaymentMethod, "fare_attributes.payment_method_valid_gtfs_enum")
		validateRuleConfig(rules.FareAttributes.Transfers, "fare_attributes.transfers_valid_gtfs_enum")
		validateRuleConfig(rules.FareAttributes.AgencyId, "fare_attributes.fare_attributes_agency_id_references_agency_table")
		validateRuleConfig(rules.FareAttributes.TransferDuration, "fare_attributes.transfer_duration_valid_seconds_range")
	}

	if rules.FareRules.File != types.SEVERITY_FORBIDDEN {
		validateRuleConfig(rules.FareRules.FareId, "fare_rules.fare_rule_fare_id_references_fare_attributes")
		validateRuleConfig(rules.FareRules.RouteId, "fare_rules.fare_rule_route_id_references_routes")
		validateRuleConfig(rules.FareRules.OriginId, "fare_rules.fare_rule_origin_id_references_zones_stops")
		validateRuleConfig(rules.FareRules.DestinationId, "fare_rules.fare_rule_destination_id_references_zones_stops")
		validateRuleConfig(rules.FareRules.ContainsId, "fare_rules.fare_rule_contains_id_references_zones_stops")
	}

	if rules.FareMedia.File != types.SEVERITY_FORBIDDEN {
		validateRuleConfig(rules.FareMedia.FareMediaId, "fare_media.fare_media_id_unique")
		validateRuleConfig(rules.FareMedia.FareMediaName, "fare_media.fare_media_name_non_empty")
		validateRuleConfig(rules.FareMedia.FareMediaType, "fare_media.fare_media_type_valid")
	}

	// Return validation errors if any
	if len(validationErrors) > 0 {
		return fmt.Errorf("validation errors: %v", validationErrors)
	}

	return nil
}

// isValidSeverity checks if the given severity is valid
func isValidSeverity(severity types.Severity) bool {
	switch severity {
	case types.SEVERITY_IGNORE, types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_FORBIDDEN:
		return true
	default:
		return false
	}
}

// ParseRulesFromFile is a convenience function to parse rules from a file path
func ParseRulesFromFile(rulesPath string) (*types.GtfsRules, error) {
	if rulesPath == "" {
		return nil, nil
	}

	parser := NewRulesParser(rulesPath)
	return parser.ParseRules()
}

func isMetaGtfsRulesSection(jsonTag string) bool {
	return jsonTag == "file_validation"
}

func (rp *RulesParser) GetRequiredFiles(rules *types.GtfsRules) []string {
	if rules == nil {
		return []string{}
	}

	allFiles := lib.GetAllStructTagValues(types.GtfsRules{}, "json")
	requiredFiles := make([]string, 0)

	for _, file := range allFiles {
		if isMetaGtfsRulesSection(file) {
			continue
		}
		// Get the nested struct field value by json tag
		fileValue := rp.getNestedFieldByTag(rules, "json", file)
		if fileValue.IsValid() && fileValue.Kind() == reflect.Struct {
			// Look for _file field in the nested struct
			fileField := rp.getNestedFieldByTag(fileValue.Addr().Interface(), "json", "_file")
			if fileField.IsValid() {
				severity := types.Severity(fileField.String())
				if severity == types.SEVERITY_ERROR {
					// Add .txt extension to match file name format
					requiredFiles = append(requiredFiles, file+".txt")
				}
			}
		}
	}

	return requiredFiles
}

// getNestedFieldByTag gets a field value by tag from a struct (handles nested structs)
func (rp *RulesParser) getNestedFieldByTag(obj interface{}, tagKey, tagValue string) reflect.Value {
	v := reflect.ValueOf(obj)
	if v.Kind() == reflect.Ptr {
		v = v.Elem()
	}

	if v.Kind() != reflect.Struct {
		return reflect.Value{}
	}

	t := v.Type()
	for i := 0; i < v.NumField(); i++ {
		field := v.Field(i)
		fieldType := t.Field(i)
		tag := fieldType.Tag.Get(tagKey)

		if tag == tagValue {
			return field
		}
	}

	return reflect.Value{}
}

func (rp *RulesParser) GetForbiddenFiles(rules *types.GtfsRules) []string {
	if rules == nil {
		return []string{}
	}

	allFiles := lib.GetAllStructTagValues(types.GtfsRules{}, "json")
	forbiddenFiles := make([]string, 0)

	for _, file := range allFiles {
		if isMetaGtfsRulesSection(file) {
			continue
		}
		// Get the nested struct field value by json tag
		fileValue := rp.getNestedFieldByTag(rules, "json", file)
		if fileValue.IsValid() && fileValue.Kind() == reflect.Struct {
			// Look for _file field in the nested struct
			fileField := rp.getNestedFieldByTag(fileValue.Addr().Interface(), "json", "_file")
			if fileField.IsValid() {
				severity := types.Severity(fileField.String())
				if severity == types.SEVERITY_FORBIDDEN {
					// Add .txt extension to match file name format
					forbiddenFiles = append(forbiddenFiles, file+".txt")
				}
			}
		}
	}

	return forbiddenFiles
}

func (rp *RulesParser) GetWarningFiles(rules *types.GtfsRules) []string {
	if rules == nil {
		return []string{}
	}

	allFiles := lib.GetAllStructTagValues(types.GtfsRules{}, "json")
	warningFiles := make([]string, 0)

	for _, file := range allFiles {
		if isMetaGtfsRulesSection(file) {
			continue
		}
		// Get the nested struct field value by json tag
		fileValue := rp.getNestedFieldByTag(rules, "json", file)
		if fileValue.IsValid() && fileValue.Kind() == reflect.Struct {
			// Look for _file field in the nested struct
			fileField := rp.getNestedFieldByTag(fileValue.Addr().Interface(), "json", "_file")
			if fileField.IsValid() {
				severity := types.Severity(fileField.String())
				if severity == types.SEVERITY_WARNING {
					// Add .txt extension to match file name format
					warningFiles = append(warningFiles, file+".txt")
				}
			}
		}
	}

	return warningFiles
}
