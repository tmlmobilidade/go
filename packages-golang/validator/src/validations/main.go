package validations

import (
	"fmt"
	"main/types"
	"sort"
	"sync"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	rulegraph "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/custom/checks"
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
)

// RuleDefinitions binds every check to its data and execution scope. Tables
// describe where a check reads; all dependencies share one global graph.
func RuleDefinitions(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) []services.RuleDefinition {
	definitions := []services.RuleDefinition{}
	hashes := map[int]string{}
	reported := map[[2]string]bool{}
	geometry := validationutils.Geometry{}
	routesWithWindows := sync.OnceValues(func() (map[string]bool, error) {
		tables, err := services.ValidationTables(gtfs.DB(), prepared...)
		if err != nil {
			return nil, err
		}
		return validationutils.RoutesWithWindows(tables)
	})
	bind := func(table string, checks services.RuleChecks) {
		ids := make([]string, 0, len(checks))
		for id := range checks {
			ids = append(ids, id)
		}
		sort.Strings(ids)
		for _, id := range ids {
			groupField := ""
			if scope := rulegraph.ExecutionScope(id); scope != "" {
				groupField = scope + "_id"
			}
			definitions = append(definitions, services.RuleDefinition{ID: id, Table: table, GroupField: groupField, Check: checks[id]})
		}
	}

	bind("agency", services.RuleChecks{
		"agency_id_field":                    fields.AgencyAgencyIdField,
		"agency_name_field":                  fields.AgencyNameField,
		"agency_url_field":                   fields.AgencyUrlField,
		"agency_timezone_field":              fields.AgencyTimezoneField,
		"agency_lang_field":                  fields.AgencyLangField,
		"agency_phone_field":                 fields.AgencyPhoneField,
		"agency_fare_url_field":              fields.AgencyFareUrlField,
		"agency_email_field":                 fields.AgencyEmailField,
		"agency_email_valid":                 standard.AgencyEmailValid,
		"agency_id_valid":                    standard.AgencyIdValid,
		"agency_id_unique":                   standard.AgencyAgencyIdUnique,
		"agency_name_valid":                  standard.AgencyNameValid,
		"agency_url_valid":                   standard.AgencyUrlValid,
		"agency_timezone_valid":              standard.AgencyTimezoneValid,
		"agency_lang_valid":                  standard.AgencyLangValid,
		"agency_phone_valid":                 standard.AgencyPhoneValid,
		"agency_fare_url_valid":              standard.AgencyFareUrlValid,
		"agency_id_matched_with_agency_name": custom.AgencyNameIdMatch,
	})
	bind("calendar", services.RuleChecks{
		"calendar_service_id_field":             fields.ServiceIdValidation,
		"calendar_start_date_field":             fields.StartDateValidation,
		"calendar_end_date_field":               fields.EndDateValidation,
		"calendar_monday_field":                 fields.MondayValidation,
		"calendar_tuesday_field":                fields.TuesdayValidation,
		"calendar_wednesday_field":              fields.WednesdayValidation,
		"calendar_thursday_field":               fields.ThursdayValidation,
		"calendar_friday_field":                 fields.FridayValidation,
		"calendar_saturday_field":               fields.SaturdayValidation,
		"calendar_sunday_field":                 fields.SundayValidation,
		"calendar_service_id_unique":            standard.ServiceIdUnique,
		"calendar_start_end_dates_valid_format": standard.DateValidFormat,
		"calendar_start_end_dates_valid":        standard.CalendarDateValid,
		"calendar_monday_valid":                 standard.MondayValid,
		"calendar_tuesday_valid":                standard.TuesdayValid,
		"calendar_wednesday_valid":              standard.WednesdayValid,
		"calendar_thursday_valid":               standard.ThursdayValid,
		"calendar_friday_valid":                 standard.FridayValid,
		"calendar_saturday_valid":               standard.SaturdayValid,
		"calendar_sunday_valid":                 standard.SundayValid,
	})
	bind("calendar_dates", services.RuleChecks{
		"calendar_dates_date_field":           fields.DateField,
		"calendar_dates_exception_type_field": fields.ExceptionTypeField,
		"calendar_dates_service_id_field":     fields.CalendarDatesServiceIdField,
		"calendar_dates_date_valid":           standard.CalendarDatesDateValid,
		"calendar_dates_exception_type_valid": standard.ExceptionTypeValid,
	})
	bind("fare_attributes", services.RuleChecks{
		"fare_attributes_fare_id_field":           fields.FareAttributesFareIdField,
		"fare_attributes_price_field":             fields.PriceField,
		"fare_attributes_currency_type_field":     fields.CurrencyTypeField,
		"fare_attributes_payment_method_field":    fields.PaymentMethodField,
		"fare_attributes_transfers_field":         fields.TransfersField,
		"fare_attributes_agency_id_field":         fields.FareAttributesAgencyIdField,
		"fare_attributes_transfer_duration_field": fields.TransferDurationField,
		"fare_attributes_fare_id_unique":          standard.FareIdUnique,
		"fare_attributes_price_valid":             standard.PriceValid,
		"fare_attributes_currency_type_valid":     standard.CurrencyTypeValid,
		"fare_attributes_payment_method_valid":    standard.PaymentMethodValid,
		"fare_attributes_transfers_valid":         standard.TransfersValid,
		"fare_attributes_agency_id_foreign":       standard.FareAttributesAgencyIdForeign,
		"fare_attributes_transfer_duration_valid": standard.TransferDurationValid,
	})
	bind("fare_rules", services.RuleChecks{
		"fare_rules_fare_id_field":          fields.FareRulesFareIdField,
		"fare_rules_route_id_field":         fields.FareRulesRouteIdField,
		"fare_rules_origin_id_field":        fields.OriginIdField,
		"fare_rules_destination_id_field":   fields.DestinationIdField,
		"fare_rules_contains_id_field":      fields.ContainsIdField,
		"fare_rules_fare_id_foreign":        standard.FareIdForeign,
		"fare_rules_route_id_foreign":       standard.FareRulesRouteIdForeign,
		"fare_rules_origin_id_foreign":      standard.OriginIdForeign,
		"fare_rules_destination_id_foreign": standard.DestinationIdForeign,
		"fare_rules_contains_id_foreign":    standard.ContainsIdForeign,
	})
	bind("feed_info", services.RuleChecks{
		"feed_info_default_lang_field":        fields.DefaultLangField,
		"feed_info_feed_lang_field":           fields.FeedLangField,
		"feed_info_feed_publisher_name_field": fields.FeedPublisherNameField,
		"feed_info_feed_publisher_url_field":  fields.FeedPublisherUrlField,
		"feed_info_feed_contact_email_field":  fields.FeedContactEmailField,
		"feed_info_feed_contact_url_field":    fields.FeedContactUrlField,
		"feed_info_feed_end_date_field":       fields.FeedEndDateField,
		"feed_info_feed_start_date_field":     fields.FeedStartDateField,
		"feed_info_feed_version_field":        fields.FeedVersionField,
		"feed_info_default_lang_valid":        standard.DefaultLangValid,
		"feed_info_feed_contact_email_valid":  standard.FeedContactEmailValid,
		"feed_info_feed_contact_url_valid":    standard.FeedContactUrlValid,
		"feed_info_feed_lang_valid":           standard.FeedLangValid,
		"feed_info_feed_publisher_url_valid":  standard.FeedPublisherUrlValid,
		"feed_info_feed_end_date_format":      standard.FeedEndDateFormat,
		"feed_info_feed_start_date_format":    standard.FeedStartDateFormat,
		"feed_info_start_end_dates_valid":     standard.FeedStartEndDateValid,
	})
	bind("frequencies", services.RuleChecks{
		"frequencies_trip_id_field":      fields.FrequenciesTripIdField,
		"frequencies_exact_times_field":  fields.ExactTimesField,
		"frequencies_headway_secs_field": fields.HeadwaySecsField,
		"frequencies_end_time_field":     fields.EndTimeField,
		"frequencies_start_time_field":   fields.StartTimeField,
		"frequencies_trip_id_foreign":    standard.FrequenciesTripIdForeign,
		"frequencies_exact_times_valid":  standard.ExactTimesValid,
		"frequencies_headway_secs_valid": standard.HeadwaySecsValid,
		"frequencies_end_time_valid":     standard.EndTimeValid,
		"frequencies_start_time_valid":   standard.StartTimeValid,
	})
	bind("levels", services.RuleChecks{
		"levels_level_id_field":    fields.LevelsLevelIdField,
		"levels_level_index_field": fields.LevelIndexField,
		"levels_level_name_field":  fields.LevelNameField,
		"levels_level_id_unique":   standard.LevelIdUnique,
		"levels_level_index_valid": standard.LevelIndexValid,
	})
	bind("pathways", services.RuleChecks{
		"pathways_max_slope_field":              fields.MaxSlopeField,
		"pathways_traversal_time_field":         fields.TraversalTimeField,
		"pathways_to_stop_id_field":             fields.PathwaysToStopIdField,
		"pathways_length_field":                 fields.LengthField,
		"pathways_min_width_field":              fields.MinWidthField,
		"pathways_reversed_signposted_as_field": fields.ReversedSignpostedAsField,
		"pathways_stair_count_field":            fields.StairCountField,
		"pathways_from_stop_id_field":           fields.PathwaysFromStopIdField,
		"pathways_pathway_id_field":             fields.PathwayIdField,
		"pathways_is_bidirectional_field":       fields.IsBidirectionalField,
		"pathways_signposted_as_field":          fields.SignpostedAsField,
		"pathways_pathway_mode_field":           fields.PathwayModeField,
		"pathways_max_slope_valid":              standard.MaxSlopeValid,
		"pathways_traversal_time_valid":         standard.TraversalTimeValid,
		"pathways_to_stop_id_foreign":           standard.PathwaysToStopIdForeign,
		"pathways_length_valid":                 standard.LengthValid,
		"pathways_min_width_valid":              standard.MinWidthValid,
		"pathways_stair_count_valid":            standard.StairCountValid,
		"pathways_from_stop_id_foreign":         standard.PathwaysFromStopIdForeign,
		"pathways_pathway_id_unique":            standard.PathwayIdUnique,
		"pathways_is_bidirectional_valid":       standard.IsBidirectionalValid,
		"pathways_pathway_mode_valid":           standard.PathwayModeValid,
	})
	bind("rider_categories", services.RuleChecks{
		"rider_categories_rider_category_id_field":        fields.RiderCategoryIdField,
		"rider_categories_rider_category_name_field":      fields.RiderCategoryNameField,
		"rider_categories_is_default_fare_category_field": fields.IsDefaultFareCategoryField,
		"rider_categories_eligibility_url_field":          fields.EligibilityUrlField,
		"rider_categories_rider_category_id_unique":       standard.RiderCategoryIdUnique,
		"rider_categories_is_default_fare_category_valid": standard.IsDefaultFareCategoryValid,
		"rider_categories_eligibility_url_valid":          standard.EligibilityUrlValid,
	})
	bind("routes", services.RuleChecks{
		"routes_agency_id_field":           fields.RoutesAgencyIdField,
		"routes_continuous_drop_off_field": fields.RoutesContinuousDropOffField,
		"routes_continuous_pickup_field":   fields.RoutesContinuousPickupField,
		"routes_line_id_field":             fields.LineIdField,
		"routes_line_long_name_field":      fields.LineLongNameField,
		"routes_line_short_name_field":     fields.LineShortNameField,
		"routes_network_id_field":          fields.NetworkIdField,
		"routes_path_type_field":           fields.PathTypeField,
		"routes_route_color_field":         fields.RouteColorField,
		"routes_route_desc_field":          fields.RouteDescField,
		"routes_route_id_field":            fields.RoutesRouteIdField,
		"routes_route_long_name_field":     fields.RouteLongNameField,
		"routes_route_short_name_field":    fields.RouteShortNameField,
		"routes_route_sort_order_field":    fields.RouteSortOrderField,
		"routes_route_text_color_field":    fields.RouteTextColorField,
		"routes_route_type_field":          fields.RouteTypeField,
		"routes_route_url_field":           fields.RouteUrlField,
		"routes_agency_id_foreign":         standard.RoutesAgencyIdUnique,
		"routes_continuous_drop_off_valid": func(db *services.SQLiteContext, context *types.RuleContext) error {
			windows, err := routesWithWindows()
			if err != nil {
				return err
			}
			return standard.RoutesContinuousDropOffValid(db, context, windows)
		},
		"routes_continuous_pickup_valid": func(db *services.SQLiteContext, context *types.RuleContext) error {
			windows, err := routesWithWindows()
			if err != nil {
				return err
			}
			return standard.RoutesContinuousPickupValid(db, context, windows)
		},
		"routes_network_id_foreign":                     standard.NetworkIdForeign,
		"routes_route_color_valid":                      standard.RouteColorValid,
		"routes_route_id_unique":                        standard.RouteIdUnique,
		"routes_route_sort_order_valid":                 standard.RouteSortOrderValid,
		"routes_route_text_color_valid":                 standard.RouteTextColorValid,
		"routes_route_type_valid":                       standard.RouteTypeValid,
		"routes_route_url_different_from_agency_url":    standard.RouteUrlDifferentAgencyUrl,
		"routes_route_url_valid":                        standard.RouteUrlValid,
		"routes_line_id_equal_route_short_name":         custom.LineIdEqualRouteShortName,
		"routes_line_short_name_equal_route_short_name": custom.LineShortNameEqualRouteShortName,
		"routes_path_type_valid":                        custom.PathTypeValid,
		"routes_route_id_format":                        custom.RouteIdFormat,
	})
	bind("shapes", services.RuleChecks{
		"shapes_shape_id_field":                            fields.ShapesShapeIdField,
		"shapes_shape_pt_lat_field":                        fields.ShapePtLatField,
		"shapes_shape_pt_lon_field":                        fields.ShapePtLonField,
		"shapes_shape_pt_sequence_field":                   fields.ShapePtSequenceField,
		"shapes_shape_dist_traveled_field":                 fields.ShapesShapeDistTraveledField,
		"shapes_shape_pt_lat_valid":                        standard.ShapePtLatValid,
		"shapes_shape_pt_lon_valid":                        standard.ShapePtLonValid,
		"shapes_shape_pt_sequence_non_negative":            standard.ShapePtSequence,
		"shapes_shape_dist_traveled_valid":                 standard.ShapesShapeDistTraveledValid,
		"shape_pt_sequence_strictly_increasing":            standard.ShapePtSequenceStrictlyIncreasing,
		"shape_dist_traveled_non_decreasing_with_sequence": standard.ShapeDistTraveledNonDecreasing,
		"shapes_shape_point_spacing_valid":                 custom.ShapePointsCoordinatesConsistent,
		"shapes_shape_dist_traveled_segment_valid":         custom.ShapePointsCoordinatesDistances,
		"shapes_shape_dist_traveled_block_valid":           custom.ShapeDistancesValid,
	})
	bind("stop_times", services.RuleChecks{
		"stop_times_arrival_time_field":                  fields.ArrivalTimeField,
		"stop_times_continuous_drop_off_field":           fields.StopTimesContinuousDropOffField,
		"stop_times_continuous_pickup_field":             fields.StopTimesContinuousPickupField,
		"stop_times_departure_time_field":                fields.DepartureTimeField,
		"stop_times_drop_off_booking_rule_id_field":      fields.DropOffBookingRuleIdField,
		"stop_times_drop_off_type_field":                 fields.DropOffTypeField,
		"stop_times_end_pickup_drop_off_window_field":    fields.EndPickupDropOffWindowField,
		"stop_times_location_group_id_field":             fields.LocationGroupIdField,
		"stop_times_pickup_booking_rule_id_field":        fields.PickupBookingRuleIdField,
		"stop_times_pickup_type_field":                   fields.PickupTypeField,
		"stop_times_shape_dist_traveled_field":           fields.StopTimesShapeDistTraveledField,
		"stop_times_start_pickup_drop_off_window_field":  fields.StartPickupDropOffWindowField,
		"stop_times_stop_headsign_field":                 fields.StopHeadsignField,
		"stop_times_stop_id_field":                       fields.StopTimesStopIdField,
		"stop_times_timepoint_field":                     fields.TimepointField,
		"stop_times_trip_id_field":                       fields.StopTimesTripIdField,
		"stop_times_arrival_departure_time_sequence":     standard.ArrivalDepartureTimeSequence,
		"stop_times_arrival_time_valid":                  standard.ArrivalTimeValid,
		"stop_times_continuous_drop_off_valid_gtfs_enum": standard.StopTimesContinuousDropOffValid,
		"stop_times_continuous_pickup_valid_gtfs_enum":   standard.StopTimesContinuousPickupValid,
		"stop_times_departure_time_valid":                standard.DepartureTimeValid,
		"stop_times_drop_off_booking_rule_id_foreign":    standard.DropOffBookingRuleIdForeign,
		"stop_times_drop_off_type_valid":                 standard.DropOffTypeValid,
		"stop_times_end_pickup_drop_off_window_valid":    standard.EndPickupDropOffWindowValid,
		"stop_times_location_group_id_forbidden":         standard.LocationGroupIdForbidden,
		"stop_times_location_id_forbidden":               standard.LocationIdForbidden,
		"stop_times_pickup_booking_rule_id_foreign":      standard.PickupBookingRuleIdForeign,
		"stop_times_pickup_type_valid":                   standard.PickupTypeValid,
		"stop_times_shape_dist_traveled_valid":           standard.StopTimesShapeDistTraveledValid,
		"stop_times_start_pickup_drop_off_window_valid":  standard.StartPickupDropOffWindowValid,
		"stop_times_stop_id_foreign":                     standard.StopIdForeign,
		"stop_times_timepoint_valid":                     standard.TimepointValid,
		"stop_times_trip_id_foreign":                     standard.StopTimesTripIdForeign,
	})
	bind("stops", services.RuleChecks{
		"stops_stop_id_field":                             fields.StopsStopIdField,
		"stops_stop_code_field":                           fields.StopCodeField,
		"stops_stop_name_field":                           fields.StopNameField,
		"stops_tts_stop_name_field":                       fields.TtsStopNameField,
		"stops_stop_desc_field":                           fields.StopDescField,
		"stops_stop_lat_field":                            fields.StopLatField,
		"stops_stop_lon_field":                            fields.StopLonField,
		"stops_zone_id_field":                             fields.ZoneIdField,
		"stops_stop_url_field":                            fields.StopUrlField,
		"stops_location_type_field":                       fields.LocationTypeField,
		"stops_parent_station_field":                      fields.ParentStationField,
		"stops_stop_timezone_field":                       fields.StopTimezoneField,
		"stops_wheelchair_boarding_field":                 fields.WheelchairBoardingField,
		"stops_level_id_field":                            fields.StopsLevelIdField,
		"stops_platform_code_field":                       fields.PlatformCodeField,
		"stops_stop_access_field":                         fields.StopAccessField,
		"stops_stop_short_name_field":                     fields.StopShortNameField,
		"stops_region_id_field":                           fields.RegionIdField,
		"stops_municipality_id_field":                     fields.MunicipalityIdField,
		"stops_parish_id_field":                           fields.ParishIdField,
		"stops_public_visible_field":                      fields.PublicVisibleField,
		"stops_shelter_code_field":                        fields.ShelterCodeField,
		"stops_shelter_maintainer_field":                  fields.ShelterMaintainerField,
		"stops_has_bench_field":                           fields.HasBenchField,
		"stops_has_network_map_field":                     fields.HasNetworkMapField,
		"stops_has_pip_real_time_field":                   fields.HasPipRealTimeField,
		"stops_has_schedules_field":                       fields.HasSchedulesField,
		"stops_has_shelter_field":                         fields.HasShelterField,
		"stops_has_stop_sign_field":                       fields.HasStopSignField,
		"stops_has_tariffs_information_field":             fields.HasTariffsInformationField,
		"stops_stop_id_unique":                            standard.StopIdUnique,
		"stops_stop_code_unique":                          standard.StopCodeUnique,
		"stops_stop_desc_different_stop_name":             standard.StopDescDifferentStopName,
		"stops_stop_lat_valid":                            standard.StopLatValid,
		"stops_stop_lon_valid":                            standard.StopLonValid,
		"stops_stop_url_valid":                            standard.StopUrlValid,
		"stops_location_type_allowed":                     standard.LocationTypeAllowed,
		"stops_location_type_valid":                       standard.LocationTypeValid,
		"stops_parent_station_empty_location_types":       standard.ParentStationEmptyLocationTypes,
		"stops_parent_station_for_location_type_one":      standard.ParentStationForLocationTypeOne,
		"stops_parent_station_foreign":                    standard.ParentStationForeign,
		"stops_stop_timezone_valid":                       standard.StopTimezoneValid,
		"stops_wheelchair_boarding_allowed":               standard.WheelchairBoardingAllowed,
		"stops_wheelchair_boarding_valid":                 standard.WheelchairBoardingValid,
		"stops_level_id_foreign":                          standard.LevelIdForeign,
		"stops_platform_code_allowed":                     standard.PlatformCodeAllowed,
		"stops_stop_access_differente_location_type_zero": standard.StopAccessDifferenteLocationTypeZero,
		"stops_stop_access_forbidden_parent_station":      standard.StopAccessForbiddenParentStation,
		"stops_stop_access_valid":                         standard.StopAccessValid,
		"stops_region_id_allowed":                         standard.RegionIdAllowed,
		"stops_municipality_id_allowed":                   standard.MunicipalityIdAllowed,
		"stops_parish_id_allowed":                         standard.ParishIdAllowed,
		"stops_public_visible_valid":                      standard.PublicVisibleValid,
		"stops_has_bench_allowed":                         standard.HasBenchAllowed,
		"stops_has_bench_valid":                           standard.HasBenchValid,
		"stops_has_network_map_allowed":                   standard.HasNetworkMapAllowed,
		"stops_has_network_map_valid":                     standard.HasNetworkMapValid,
		"stops_has_pip_real_time_allowed":                 standard.HasPipRealTimeAllowed,
		"stops_has_pip_real_time_valid":                   standard.HasPipRealTimeValid,
		"stops_has_schedules_allowed":                     standard.HasSchedulesAllowed,
		"stops_has_schedules_valid":                       standard.HasSchedulesValid,
		"stops_has_shelter_allowed":                       standard.HasShelterAllowed,
		"stops_has_shelter_valid":                         standard.HasShelterValid,
		"stops_has_stop_sign_allowed":                     standard.HasStopSignAllowed,
		"stops_has_stop_sign_valid":                       standard.HasStopSignValid,
		"stops_has_tariffs_information_allowed":           standard.HasTariffsInformationAllowed,
		"stops_has_tariffs_information_valid":             standard.HasTariffsInformationValid,
	})
	bind("transfers", services.RuleChecks{
		"transfers_from_stop_id_field":      fields.TransfersFromStopIdField,
		"transfers_to_stop_id_field":        fields.TransfersToStopIdField,
		"transfers_from_route_id_field":     fields.FromRouteIdField,
		"transfers_to_route_id_field":       fields.ToRouteIdField,
		"transfers_from_trip_id_field":      fields.FromTripIdField,
		"transfers_to_trip_id_field":        fields.ToTripIdField,
		"transfers_transfer_type_field":     fields.TransferTypeField,
		"transfers_min_transfer_time_field": fields.MinTransferTimeField,
		"transfers_from_stop_id_foreign":    standard.TransfersFromStopIdForeign,
		"transfers_from_route_id_foreign":   standard.FromRouteIdForeign,
		"transfers_from_trip_id_foreign":    standard.FromTripIdForeign,
		"transfers_to_stop_id_foreign":      standard.TransfersToStopIdForeign,
		"transfers_to_route_id_foreign":     standard.ToRouteIdForeign,
		"transfers_to_trip_id_foreign":      standard.ToTripIdForeign,
		"transfers_transfer_type_valid":     standard.TransferTypeValid,
		"transfers_min_transfer_time_valid": standard.MinTransferTimeValid,
	})
	bind("trips", services.RuleChecks{
		"trips_route_id_field":                           fields.TripsRouteIdField,
		"trips_service_id_field":                         fields.TripsServiceIdField,
		"trips_trip_id_field":                            fields.TripsTripIdField,
		"trips_trip_headsign_field":                      fields.TripHeadsignField,
		"trips_trip_short_name_field":                    fields.TripShortNameField,
		"trips_direction_id_field":                       fields.DirectionIdField,
		"trips_block_id_field":                           fields.BlockIdField,
		"trips_shape_id_field":                           fields.TripsShapeIdField,
		"trips_wheelchair_accessible_field":              fields.TripsWheelchairAccessibleField,
		"trips_bikes_allowed_field":                      fields.BikesAllowedField,
		"trips_pattern_id_field":                         fields.PatternIdField,
		"trips_trip_id_unique":                           standard.TripIdUnique,
		"trips_route_id_foreign":                         standard.TripsRouteIdForeign,
		"trips_shape_id_foreign":                         standard.ShapeIdForeign,
		"trips_service_id_foreign":                       standard.TripsServiceIdForeign,
		"trips_direction_id_valid":                       standard.DirectionIdValid,
		"trips_bikes_allowed_valid":                      standard.BikesAllowedValid,
		"trips_wheelchair_accessible_valid":              standard.TripsWheelchairAccessibleValid,
		"trips_trip_id_max_length":                       custom.TripIdMaxLength,
		"trips_pattern_id_same_shape_id":                 custom.PatternIdSameShapeId,
		"trips_shape_id_route_direction_match":           custom.ShapeIdRouteDirectionMatch,
		"trips_direction_pattern_id_match":               custom.DirectionPatternIdMatch,
		"trips_pattern_id_format":                        custom.PatternIdFormat,
		"trips_route_id_pattern_consistent":              custom.RouteIdPatternConsistent,
		"trips_direction_id_pattern_consistent":          custom.DirectionIdPatternConsistent,
		"trips_trip_headsign_pattern_consistent":         custom.TripHeadsignPatternConsistent,
		"trips_shape_id_max_two_per_route":               custom.ShapeIdMaxTwoPerRoute,
		"trips_shape_id_route_direction_consistent":      custom.ShapeIdRouteDirectionConsistent,
		"trips_trip_headsign_max_two_per_route":          custom.TripHeadsignMaxTwoPerRoute,
		"trips_trip_headsign_route_direction_consistent": custom.TripHeadsignRouteDirectionConsistent,
		"trips_pattern_required_fields":                  custom.PatternRequiredFields,
		"trips_one_shape_per_pattern": func(db *services.SQLiteContext, context *types.RuleContext) error {
			return custom.OneShapePerPattern(db, context, reported)
		},
		"trips_one_pattern_per_shape": func(db *services.SQLiteContext, context *types.RuleContext) error {
			return custom.OnePatternPerShape(db, context, reported)
		},
		"trips_stop_sequence": func(db *services.SQLiteContext, context *types.RuleContext) error {
			return custom.StopSequence(db, context, hashes)
		},
		"trips_pattern_single_signature": func(db *services.SQLiteContext, context *types.RuleContext) error {
			return custom.PatternSingleSignature(db, context, hashes)
		},
		"trips_stop_coordinates": func(db *services.SQLiteContext, context *types.RuleContext) error {
			return custom.StopCoordinates(db, context, &geometry)
		},
	})
	bind("vehicles", services.RuleChecks{
		"vehicles_agency_id_field":             fields.VehiclesAgencyIdField,
		"vehicles_vehicle_id_field":            fields.VehicleIdField,
		"vehicles_license_plate_field":         fields.LicensePlateField,
		"vehicles_make_field":                  fields.MakeField,
		"vehicles_model_field":                 fields.ModelField,
		"vehicles_registration_date_field":     fields.RegistrationDateField,
		"vehicles_vehicle_type_field":          fields.VehicleTypeField,
		"vehicles_emission_field":              fields.EmissionField,
		"vehicles_propulsion_field":            fields.PropulsionField,
		"vehicles_wheelchair_accessible_field": fields.VehiclesWheelchairAccessibleField,
		"vehicles_bicycles_capacity_field":     fields.BicyclesCapacityField,
		"vehicles_total_capacity_field":        fields.TotalCapacityField,
		"vehicles_car_capacity_field":          fields.CarCapacityField,
		"vehicles_agency_id_foreign":           standard.VehiclesAgencyIdForeign,
		"vehicles_vehicle_id_unique":           standard.VehicleIdUnique,
		"vehicles_propulsion_valid":            standard.PropulsionValid,
		"vehicles_total_capacity_valid":        standard.TotalCapacityValid,
		"vehicles_registration_date_valid":     standard.RegistrationDateValid,
		"vehicles_bicycles_capacity_valid":     standard.BicyclesCapacityValid,
		"vehicles_vehicle_type_valid":          standard.VehicleTypeValid,
		"vehicles_car_capacity_valid":          standard.CarCapacityValid,
		"vehicles_wheelchair_accessible_valid": standard.VehiclesWheelchairAccessibleValid,
		"vehicles_emission_valid":              standard.EmissionValid,
		"vehicles_license_plate_valid":         custom.LicensePlateValid,
	})

	findings := &validationutils.Findings{}
	definitions = append(definitions, services.RuleDefinition{
		ID: types.RuleIDGtfsFeedFilePresenceAndIntegrity, Always: true,
		Run: func() rulegraph.Status {
			before := services.AppMessageService.RuleIssueCount(types.RuleIDGtfsFeedFilePresenceAndIntegrity)
			standard.FilePresenceAndIntegrity(findings, gtfs, config)
			if services.AppMessageService.RuleIssueCount(types.RuleIDGtfsFeedFilePresenceAndIntegrity) != before {
				return rulegraph.Failed
			}
			return rulegraph.Passed
		},
	})
	for _, table := range types.GtfsRuleFiles {
		definitions = append(definitions, services.RuleDefinition{
			ID: rulegraph.FileNode(table), Always: true,
			Run: func() rulegraph.Status {
				standard.FileMissing(findings, gtfs, config, table)
				if gtfs.HasTable(table) {
					return rulegraph.Passed
				}
				return rulegraph.Failed
			},
		})
	}
	return definitions
}

func RuleIDs() []string {
	definitions := RuleDefinitions(types.Gtfs{}, nil)
	ids := make([]string, 0, len(definitions))
	for _, definition := range definitions {
		ids = append(ids, definition.ID)
	}
	return ids
}

// Run executes the entire configured graph, including file-presence checks.
func Run(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) (map[string]rulegraph.Status, error) {
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		return nil, err
	}
	runner, err := services.NewRuleRunner(config, tables, RuleDefinitions(gtfs, config, tables))
	if err != nil {
		return nil, err
	}
	return runner.Run()
}

// Legacy entry points delegate to the same global run. They no longer select
// a file section or build a separate dependency graph.
func runConfigured(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) {
	if _, err := Run(gtfs, config, prepared...); err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating GTFS: %v", err))
	}
}

func RunAgencyValidations(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runConfigured(gtfs, config, prepared...)
}
func RunCalendarValidations(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runConfigured(gtfs, config, prepared...)
}
func RunCalendarDatesValidations(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runConfigured(gtfs, config, prepared...)
}
func RunFareAttributesValidations(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runConfigured(gtfs, config, prepared...)
}
func RunFareRulesValidations(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runConfigured(gtfs, config, prepared...)
}
func RunFeedInfoValidations(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runConfigured(gtfs, config, prepared...)
}
func RunFrequenciesValidations(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runConfigured(gtfs, config, prepared...)
}
func RunLevelsValidations(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runConfigured(gtfs, config, prepared...)
}
func RunPathwaysValidations(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runConfigured(gtfs, config, prepared...)
}
func RunRiderCategoriesValidations(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runConfigured(gtfs, config, prepared...)
}
func RunRoutesValidations(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runConfigured(gtfs, config, prepared...)
}
func RunShapesValidations(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runConfigured(gtfs, config, prepared...)
}
func RunStopTimesValidations(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runConfigured(gtfs, config, prepared...)
}
func RunStopsValidations(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runConfigured(gtfs, config, prepared...)
}
func RunTransfersValidations(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runConfigured(gtfs, config, prepared...)
}
func RunTripsValidations(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runConfigured(gtfs, config, prepared...)
}
func RunVehiclesValidations(gtfs types.Gtfs, config *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runConfigured(gtfs, config, prepared...)
}

type FileValidation struct{ *types.Validation }

func NewFileValidation() *FileValidation {
	return &FileValidation{Validation: &types.Validation{ID: "file_validation", Description: "Validate file data"}}
}
func (v *FileValidation) Validate(gtfs types.Gtfs, config *types.GtfsRules) bool {
	before := services.AppMessageService.TotalErrors()
	if _, err := Run(gtfs, config); err != nil {
		lib.AppLogger.Error(err.Error())
		return true
	}
	return services.AppMessageService.TotalErrors() > before
}
