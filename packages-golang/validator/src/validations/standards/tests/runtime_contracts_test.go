package standard_test

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
	testutil "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

// Every migrated row rule must honor the same runtime boundary. Keep this list
// explicit so renamed or removed callbacks fail at compile time.
var migratedChecks = []standardCheck{
	{id: "agency_email_valid", table: "agency", field: "agency_email", run: standard.AgencyEmailValid, columns: []string{"agency_email"}, required: []string{"agency"}},
	{id: "agency_fare_url_valid", table: "agency", field: "agency_fare_url", run: standard.AgencyFareUrlValid, columns: []string{"agency_fare_url"}, required: []string{"agency"}},
	{id: "agency_id_unique", table: "agency", field: "agency_id", run: standard.AgencyAgencyIdUnique, columns: []string{"agency_id"}, required: []string{"agency"}},
	{id: "agency_id_valid", table: "agency", field: "agency_id", run: standard.AgencyIdValid, columns: []string{"agency_id"}, required: []string{"agency"}},
	{id: "agency_lang_valid", table: "agency", field: "agency_lang", run: standard.AgencyLangValid, columns: []string{"agency_lang"}, required: []string{"agency"}},
	{id: "agency_name_valid", table: "agency", field: "agency_name", run: standard.AgencyNameValid, columns: []string{"agency_name"}, required: []string{"agency"}},
	{id: "agency_phone_valid", table: "agency", field: "agency_phone", run: standard.AgencyPhoneValid, columns: []string{"agency_phone"}, required: []string{"agency"}},
	{id: "agency_timezone_valid", table: "agency", field: "agency_timezone", run: standard.AgencyTimezoneValid, columns: []string{"agency_timezone"}, required: []string{"agency"}},
	{id: "agency_url_valid", table: "agency", field: "agency_url", run: standard.AgencyUrlValid, columns: []string{"agency_url"}, required: []string{"agency"}},
	{id: "calendar_start_end_dates_valid_format", table: "calendar", field: "start_date", run: standard.DateValidFormat, columns: []string{"start_date", "end_date"}, required: []string{"calendar"}},
	{id: "calendar_start_end_dates_valid", table: "calendar", field: "start_date", run: standard.CalendarDateValid, columns: []string{"start_date", "end_date"}, required: []string{"calendar"}},
	{id: "calendar_dates_date_valid", table: "calendar_dates", field: "date", run: standard.CalendarDatesDateValid, columns: []string{"date"}, required: []string{"calendar_dates"}},
	{id: "calendar_dates_exception_type_valid", table: "calendar_dates", field: "exception_type", run: standard.ExceptionTypeValid, columns: []string{"exception_type"}, required: []string{"calendar_dates"}},
	{id: "calendar_friday_valid", table: "calendar", field: "friday", run: standard.FridayValid, columns: []string{"friday"}, required: []string{"calendar"}},
	{id: "calendar_monday_valid", table: "calendar", field: "monday", run: standard.MondayValid, columns: []string{"monday"}, required: []string{"calendar"}},
	{id: "calendar_saturday_valid", table: "calendar", field: "saturday", run: standard.SaturdayValid, columns: []string{"saturday"}, required: []string{"calendar"}},
	{id: "calendar_service_id_unique", table: "calendar", field: "service_id", run: standard.ServiceIdUnique, columns: []string{"service_id"}, required: []string{"calendar"}},
	{id: "calendar_sunday_valid", table: "calendar", field: "sunday", run: standard.SundayValid, columns: []string{"sunday"}, required: []string{"calendar"}},
	{id: "calendar_thursday_valid", table: "calendar", field: "thursday", run: standard.ThursdayValid, columns: []string{"thursday"}, required: []string{"calendar"}},
	{id: "calendar_tuesday_valid", table: "calendar", field: "tuesday", run: standard.TuesdayValid, columns: []string{"tuesday"}, required: []string{"calendar"}},
	{id: "calendar_wednesday_valid", table: "calendar", field: "wednesday", run: standard.WednesdayValid, columns: []string{"wednesday"}, required: []string{"calendar"}},
	{id: "fare_attributes_agency_id_foreign", table: "fare_attributes", field: "agency_id", run: standard.FareAttributesAgencyIdForeign, columns: []string{"agency_id"}, required: []string{"fare_attributes", "agency"}},
	{id: "fare_attributes_currency_type_valid", table: "fare_attributes", field: "currency_type", run: standard.CurrencyTypeValid, columns: []string{"currency_type"}, required: []string{"fare_attributes"}},
	{id: "fare_attributes_fare_id_unique", table: "fare_attributes", field: "fare_id", run: standard.FareIdUnique, columns: []string{"fare_id"}, required: []string{"fare_attributes"}},
	{id: "fare_attributes_payment_method_valid", table: "fare_attributes", field: "payment_method", run: standard.PaymentMethodValid, columns: []string{"payment_method"}, required: []string{"fare_attributes"}},
	{id: "fare_attributes_price_valid", table: "fare_attributes", field: "price", run: standard.PriceValid, columns: []string{"price"}, required: []string{"fare_attributes"}},
	{id: "fare_attributes_transfer_duration_valid", table: "fare_attributes", field: "transfer_duration", run: standard.TransferDurationValid, columns: []string{"transfer_duration"}, required: []string{"fare_attributes"}},
	{id: "fare_attributes_transfers_valid", table: "fare_attributes", field: "transfers", run: standard.TransfersValid, columns: []string{"transfers"}, required: []string{"fare_attributes"}},
	{id: "fare_rules_contains_id_foreign", table: "fare_rules", field: "contains_id", run: standard.ContainsIdForeign, columns: []string{"contains_id"}, required: []string{"fare_rules", "stops"}},
	{id: "fare_rules_destination_id_foreign", table: "fare_rules", field: "destination_id", run: standard.DestinationIdForeign, columns: []string{"destination_id"}, required: []string{"fare_rules", "stops"}},
	{id: "fare_rules_fare_id_foreign", table: "fare_rules", field: "fare_id", run: standard.FareIdForeign, columns: []string{"fare_id"}, required: []string{"fare_rules", "fare_attributes"}},
	{id: "fare_rules_origin_id_foreign", table: "fare_rules", field: "origin_id", run: standard.OriginIdForeign, columns: []string{"origin_id"}, required: []string{"fare_rules", "stops"}},
	{id: "fare_rules_route_id_foreign", table: "fare_rules", field: "route_id", run: standard.FareRulesRouteIdForeign, columns: []string{"route_id"}, required: []string{"fare_rules", "routes"}},
	{id: "feed_info_default_lang_valid", table: "feed_info", field: "default_lang", run: standard.DefaultLangValid, columns: []string{"default_lang"}, required: []string{"feed_info"}},
	{id: "feed_info_feed_contact_email_valid", table: "feed_info", field: "feed_contact_email", run: standard.FeedContactEmailValid, columns: []string{"feed_contact_email"}, required: []string{"feed_info"}},
	{id: "feed_info_feed_contact_url_valid", table: "feed_info", field: "feed_contact_url", run: standard.FeedContactUrlValid, columns: []string{"feed_contact_url"}, required: []string{"feed_info"}},
	{id: "feed_info_feed_end_date_format", table: "feed_info", field: "feed_end_date", run: standard.FeedEndDateFormat, columns: []string{"feed_end_date"}, required: []string{"feed_info"}},
	{id: "feed_info_feed_lang_valid", table: "feed_info", field: "feed_lang", run: standard.FeedLangValid, columns: []string{"feed_lang"}, required: []string{"feed_info"}},
	{id: "feed_info_feed_publisher_url_valid", table: "feed_info", field: "feed_publisher_url", run: standard.FeedPublisherUrlValid, columns: []string{"feed_publisher_url"}, required: []string{"feed_info"}},
	{id: "feed_info_feed_start_date_format", table: "feed_info", field: "feed_start_date", run: standard.FeedStartDateFormat, columns: []string{"feed_start_date"}, required: []string{"feed_info"}},
	{id: "feed_info_start_end_dates_valid", table: "feed_info", field: "feed_start_date", run: standard.FeedStartEndDateValid, columns: []string{"feed_start_date", "feed_end_date"}, required: []string{"feed_info"}},
	{id: "file_validation_gtfs_feed_file_presence_and_integrity_rule", table: "routes", field: "network_id", run: standard.FilePresenceAndIntegrity, columns: []string{"network_id"}, required: []string{"routes"}},
	{id: "frequencies_end_time_valid", table: "frequencies", field: "end_time", run: standard.EndTimeValid, columns: []string{"end_time"}, required: []string{"frequencies"}},
	{id: "frequencies_exact_times_valid", table: "frequencies", field: "exact_times", run: standard.ExactTimesValid, columns: []string{"exact_times"}, required: []string{"frequencies"}},
	{id: "frequencies_headway_secs_valid", table: "frequencies", field: "headway_secs", run: standard.HeadwaySecsValid, columns: []string{"headway_secs"}, required: []string{"frequencies"}},
	{id: "frequencies_start_time_valid", table: "frequencies", field: "start_time", run: standard.StartTimeValid, columns: []string{"start_time"}, required: []string{"frequencies"}},
	{id: "frequencies_trip_id_foreign", table: "frequencies", field: "trip_id", run: standard.FrequenciesTripIdForeign, columns: []string{"trip_id"}, required: []string{"frequencies", "trips"}},
	{id: "levels_level_id_unique", table: "levels", field: "level_id", run: standard.LevelIdUnique, columns: []string{"level_id"}, required: []string{"levels"}},
	{id: "levels_level_index_valid", table: "levels", field: "level_index", run: standard.LevelIndexValid, columns: []string{"level_index"}, required: []string{"levels"}},
	{id: "pathways_from_stop_id_foreign", table: "pathways", field: "from_stop_id", run: standard.PathwaysFromStopIdForeign, columns: []string{"from_stop_id"}, required: []string{"pathways", "stops"}},
	{id: "pathways_is_bidirectional_valid", table: "pathways", field: "is_bidirectional", run: standard.IsBidirectionalValid, columns: []string{"is_bidirectional", "pathway_mode"}, required: []string{"pathways"}},
	{id: "pathways_length_valid", table: "pathways", field: "length", run: standard.LengthValid, columns: []string{"length"}, required: []string{"pathways"}},
	{id: "pathways_max_slope_valid", table: "pathways", field: "max_slope", run: standard.MaxSlopeValid, columns: []string{"max_slope", "pathway_mode"}, required: []string{"pathways"}},
	{id: "pathways_min_width_valid", table: "pathways", field: "min_width", run: standard.MinWidthValid, columns: []string{"min_width"}, required: []string{"pathways"}},
	{id: "pathways_pathway_id_unique", table: "pathways", field: "pathway_id", run: standard.PathwayIdUnique, columns: []string{"pathway_id"}, required: []string{"pathways"}},
	{id: "pathways_pathway_mode_valid", table: "pathways", field: "pathway_mode", run: standard.PathwayModeValid, columns: []string{"pathway_mode"}, required: []string{"pathways"}},
	{id: "pathways_stair_count_valid", table: "pathways", field: "stair_count", run: standard.StairCountValid, columns: []string{"stair_count"}, required: []string{"pathways"}},
	{id: "pathways_to_stop_id_foreign", table: "pathways", field: "to_stop_id", run: standard.PathwaysToStopIdForeign, columns: []string{"to_stop_id"}, required: []string{"pathways", "stops"}},
	{id: "pathways_traversal_time_valid", table: "pathways", field: "traversal_time", run: standard.TraversalTimeValid, columns: []string{"traversal_time"}, required: []string{"pathways"}},
	{id: "rider_categories_eligibility_url_valid", table: "rider_categories", field: "eligibility_url", run: standard.EligibilityUrlValid, columns: []string{"eligibility_url"}, required: []string{"rider_categories"}},
	{id: "rider_categories_is_default_fare_category_valid", table: "rider_categories", field: "is_default_fare_category", run: standard.IsDefaultFareCategoryValid, columns: []string{"is_default_fare_category"}, required: []string{"rider_categories"}},
	{id: "rider_categories_rider_category_id_unique", table: "rider_categories", field: "rider_category_id", run: standard.RiderCategoryIdUnique, columns: []string{"rider_category_id"}, required: []string{"rider_categories"}},
	{id: "routes_agency_id_foreign", table: "routes", field: "agency_id", run: standard.RoutesAgencyIdUnique, columns: []string{"agency_id"}, required: []string{"routes", "agency"}},
	{id: "routes_continuous_drop_off_valid", table: "routes", field: "continuous_drop_off", run: standard.RoutesContinuousDropOffValid, columns: []string{"continuous_drop_off", "route_id"}, required: []string{"routes", "trips", "stop_times"}},
	{id: "routes_continuous_pickup_valid", table: "routes", field: "continuous_pickup", run: standard.RoutesContinuousPickupValid, columns: []string{"continuous_pickup", "route_id"}, required: []string{"routes", "trips", "stop_times"}},
	{id: "routes_network_id_foreign", table: "routes", field: "network_id", run: standard.NetworkIdForeign, columns: []string{"network_id"}, required: []string{"routes", "route_networks"}},
	{id: "routes_route_color_valid", table: "routes", field: "route_color", run: standard.RouteColorValid, columns: []string{"route_color"}, required: []string{"routes"}},
	{id: "routes_route_id_unique", table: "routes", field: "route_id", run: standard.RouteIdUnique, columns: []string{"route_id"}, required: []string{"routes"}},
	{id: "routes_route_sort_order_valid", table: "routes", field: "route_sort_order", run: standard.RouteSortOrderValid, columns: []string{"route_sort_order"}, required: []string{"routes"}},
	{id: "routes_route_text_color_valid", table: "routes", field: "route_text_color", run: standard.RouteTextColorValid, columns: []string{"route_text_color"}, required: []string{"routes"}},
	{id: "routes_route_type_valid", table: "routes", field: "route_type", run: standard.RouteTypeValid, columns: []string{"route_type"}, required: []string{"routes"}},
	{id: "routes_route_url_different_from_agency_url", table: "routes", field: "route_url", run: standard.RouteUrlDifferentAgencyUrl, columns: []string{"route_url", "agency_id"}, required: []string{"routes", "agency"}},
	{id: "routes_route_url_valid", table: "routes", field: "route_url", run: standard.RouteUrlValid, columns: []string{"route_url"}, required: []string{"routes"}},
	{id: "shape_dist_traveled_non_decreasing_with_sequence", table: "shapes", field: "shape_dist_traveled", run: standard.ShapeDistTraveledNonDecreasing, columns: []string{"shape_id", "shape_pt_sequence", "shape_dist_traveled"}, required: []string{"shapes"}},
	{id: "shapes_shape_dist_traveled_valid", table: "shapes", field: "shape_dist_traveled", run: standard.ShapesShapeDistTraveledValid, columns: []string{"shape_dist_traveled"}, required: []string{"shapes"}},
	{id: "shapes_shape_pt_lat_valid", table: "shapes", field: "shape_pt_lat", run: standard.ShapePtLatValid, columns: []string{"shape_pt_lat"}, required: []string{"shapes"}},
	{id: "shapes_shape_pt_lon_valid", table: "shapes", field: "shape_pt_lon", run: standard.ShapePtLonValid, columns: []string{"shape_pt_lon"}, required: []string{"shapes"}},
	{id: "shapes_shape_pt_sequence_non_negative", table: "shapes", field: "shape_pt_sequence", run: standard.ShapePtSequence, columns: []string{"shape_pt_sequence"}, required: []string{"shapes"}},
	{id: "shape_pt_sequence_strictly_increasing", table: "shapes", field: "shape_pt_sequence", run: standard.ShapePtSequenceStrictlyIncreasing, columns: []string{"shape_id", "shape_pt_sequence", "shape_dist_traveled"}, required: []string{"shapes"}},
	{id: "stop_times_arrival_departure_time_sequence", table: "stop_times", field: "arrival_time", run: standard.ArrivalDepartureTimeSequence, columns: []string{"arrival_time", "trip_id", "stop_sequence", "departure_time"}, required: []string{"stop_times"}},
	{id: "stop_times_arrival_time_valid", table: "stop_times", field: "arrival_time", run: standard.ArrivalTimeValid, columns: []string{"arrival_time"}, required: []string{"stop_times"}},
	{id: "stop_times_continuous_drop_off_valid_gtfs_enum", table: "stop_times", field: "continuous_drop_off", run: standard.StopTimesContinuousDropOffValid, columns: []string{"continuous_drop_off", "start_pickup_drop_off_window", "end_pickup_drop_off_window"}, required: []string{"stop_times"}},
	{id: "stop_times_continuous_pickup_valid_gtfs_enum", table: "stop_times", field: "continuous_pickup", run: standard.StopTimesContinuousPickupValid, columns: []string{"continuous_pickup", "start_pickup_drop_off_window", "end_pickup_drop_off_window"}, required: []string{"stop_times"}},
	{id: "stop_times_departure_time_valid", table: "stop_times", field: "departure_time", run: standard.DepartureTimeValid, columns: []string{"departure_time"}, required: []string{"stop_times"}},
	{id: "stop_times_drop_off_booking_rule_id_foreign", table: "stop_times", field: "drop_off_booking_rule_id", run: standard.DropOffBookingRuleIdForeign, columns: []string{"drop_off_booking_rule_id"}, required: []string{"stop_times", "booking_rules"}},
	{id: "stop_times_drop_off_type_valid", table: "stop_times", field: "drop_off_type", run: standard.DropOffTypeValid, columns: []string{"drop_off_type"}, required: []string{"stop_times"}},
	{id: "stop_times_end_pickup_drop_off_window_valid", table: "stop_times", field: "end_pickup_drop_off_window", run: standard.EndPickupDropOffWindowValid, columns: []string{"end_pickup_drop_off_window", "start_pickup_drop_off_window", "arrival_time", "departure_time", "location_group_id", "location_id"}, required: []string{"stop_times"}},
	{id: "stop_times_location_group_id_forbidden", table: "stop_times", field: "location_group_id", run: standard.LocationGroupIdForbidden, columns: []string{"location_group_id", "stop_id", "location_id"}, required: []string{"stop_times"}},
	{id: "stop_times_location_id_forbidden", table: "stop_times", field: "location_id", run: standard.LocationIdForbidden, columns: []string{"location_id", "stop_id", "location_group_id"}, required: []string{"stop_times"}},
	{id: "stop_times_pickup_booking_rule_id_foreign", table: "stop_times", field: "pickup_booking_rule_id", run: standard.PickupBookingRuleIdForeign, columns: []string{"pickup_booking_rule_id"}, required: []string{"stop_times", "booking_rules"}},
	{id: "stop_times_pickup_type_valid", table: "stop_times", field: "pickup_type", run: standard.PickupTypeValid, columns: []string{"pickup_type"}, required: []string{"stop_times"}},
	{id: "stop_times_shape_dist_traveled_valid", table: "stop_times", field: "shape_dist_traveled", run: standard.StopTimesShapeDistTraveledValid, columns: []string{"shape_dist_traveled"}, required: []string{"stop_times"}},
	{id: "stop_times_start_pickup_drop_off_window_valid", table: "stop_times", field: "start_pickup_drop_off_window", run: standard.StartPickupDropOffWindowValid, columns: []string{"start_pickup_drop_off_window", "end_pickup_drop_off_window", "arrival_time", "departure_time", "location_group_id", "location_id"}, required: []string{"stop_times"}},
	{id: "stop_times_stop_id_foreign", table: "stop_times", field: "stop_id", run: standard.StopIdForeign, columns: []string{"stop_id"}, required: []string{"stop_times", "stops"}},
	{id: "stop_times_timepoint_valid", table: "stop_times", field: "timepoint", run: standard.TimepointValid, columns: []string{"timepoint"}, required: []string{"stop_times"}},
	{id: "stop_times_trip_id_foreign", table: "stop_times", field: "trip_id", run: standard.StopTimesTripIdForeign, columns: []string{"trip_id"}, required: []string{"stop_times", "trips"}},
	{id: "stops_has_bench_allowed", table: "stops", field: "has_bench", run: standard.HasBenchAllowed, columns: []string{"has_bench"}, required: []string{"stops"}},
	{id: "stops_has_bench_valid", table: "stops", field: "has_bench", run: standard.HasBenchValid, columns: []string{"has_bench"}, required: []string{"stops"}},
	{id: "stops_has_network_map_allowed", table: "stops", field: "has_network_map", run: standard.HasNetworkMapAllowed, columns: []string{"has_network_map"}, required: []string{"stops"}},
	{id: "stops_has_network_map_valid", table: "stops", field: "has_network_map", run: standard.HasNetworkMapValid, columns: []string{"has_network_map"}, required: []string{"stops"}},
	{id: "stops_has_pip_real_time_allowed", table: "stops", field: "has_pip_real_time", run: standard.HasPipRealTimeAllowed, columns: []string{"has_pip_real_time"}, required: []string{"stops"}},
	{id: "stops_has_pip_real_time_valid", table: "stops", field: "has_pip_real_time", run: standard.HasPipRealTimeValid, columns: []string{"has_pip_real_time"}, required: []string{"stops"}},
	{id: "stops_has_schedules_allowed", table: "stops", field: "has_schedules", run: standard.HasSchedulesAllowed, columns: []string{"has_schedules"}, required: []string{"stops"}},
	{id: "stops_has_schedules_valid", table: "stops", field: "has_schedules", run: standard.HasSchedulesValid, columns: []string{"has_schedules"}, required: []string{"stops"}},
	{id: "stops_has_shelter_allowed", table: "stops", field: "has_shelter", run: standard.HasShelterAllowed, columns: []string{"has_shelter"}, required: []string{"stops"}},
	{id: "stops_has_shelter_valid", table: "stops", field: "has_shelter", run: standard.HasShelterValid, columns: []string{"has_shelter"}, required: []string{"stops"}},
	{id: "stops_has_stop_sign_allowed", table: "stops", field: "has_stop_sign", run: standard.HasStopSignAllowed, columns: []string{"has_stop_sign"}, required: []string{"stops"}},
	{id: "stops_has_stop_sign_valid", table: "stops", field: "has_stop_sign", run: standard.HasStopSignValid, columns: []string{"has_stop_sign"}, required: []string{"stops"}},
	{id: "stops_has_tariffs_information_allowed", table: "stops", field: "has_tariffs_information", run: standard.HasTariffsInformationAllowed, columns: []string{"has_tariffs_information"}, required: []string{"stops"}},
	{id: "stops_has_tariffs_information_valid", table: "stops", field: "has_tariffs_information", run: standard.HasTariffsInformationValid, columns: []string{"has_tariffs_information"}, required: []string{"stops"}},
	{id: "stops_level_id_foreign", table: "stops", field: "level_id", run: standard.LevelIdForeign, columns: []string{"level_id"}, required: []string{"stops", "levels"}},
	{id: "stops_location_type_allowed", table: "stops", field: "location_type", run: standard.LocationTypeAllowed, columns: []string{"location_type"}, required: []string{"stops"}},
	{id: "stops_location_type_valid", table: "stops", field: "location_type", run: standard.LocationTypeValid, columns: []string{"location_type"}, required: []string{"stops"}},
	{id: "stops_municipality_id_allowed", table: "stops", field: "municipality_id", run: standard.MunicipalityIdAllowed, columns: []string{"municipality_id"}, required: []string{"stops"}},
	{id: "stops_parent_station_empty_location_types", table: "stops", field: "parent_station", run: standard.ParentStationEmptyLocationTypes, columns: []string{"parent_station", "location_type"}, required: []string{"stops"}},
	{id: "stops_parent_station_for_location_type_one", table: "stops", field: "parent_station", run: standard.ParentStationForLocationTypeOne, columns: []string{"parent_station", "location_type"}, required: []string{"stops"}},
	{id: "stops_parent_station_foreign", table: "stops", field: "parent_station", run: standard.ParentStationForeign, columns: []string{"parent_station"}, required: []string{"stops"}},
	{id: "stops_parish_id_allowed", table: "stops", field: "parish_id", run: standard.ParishIdAllowed, columns: []string{"parish_id"}, required: []string{"stops"}},
	{id: "stops_platform_code_allowed", table: "stops", field: "platform_code", run: standard.PlatformCodeAllowed, columns: []string{"platform_code"}, required: []string{"stops"}},
	{id: "stops_public_visible_valid", table: "stops", field: "public_visible", run: standard.PublicVisibleValid, columns: []string{"public_visible"}, required: []string{"stops"}},
	{id: "stops_region_id_allowed", table: "stops", field: "region_id", run: standard.RegionIdAllowed, columns: []string{"region_id"}, required: []string{"stops"}},
	{id: "stops_stop_access_differente_location_type_zero", table: "stops", field: "stop_access", run: standard.StopAccessDifferenteLocationTypeZero, columns: []string{"stop_access", "location_type"}, required: []string{"stops"}},
	{id: "stops_stop_access_forbidden_parent_station", table: "stops", field: "stop_access", run: standard.StopAccessForbiddenParentStation, columns: []string{"stop_access", "parent_station"}, required: []string{"stops"}},
	{id: "stops_stop_access_valid", table: "stops", field: "stop_access", run: standard.StopAccessValid, columns: []string{"stop_access"}, required: []string{"stops"}},
	{id: "stops_stop_code_unique", table: "stops", field: "stop_code", run: standard.StopCodeUnique, columns: []string{"stop_code"}, required: []string{"stops"}},
	{id: "stops_stop_desc_different_stop_name", table: "stops", field: "stop_desc", run: standard.StopDescDifferentStopName, columns: []string{"stop_desc", "stop_name"}, required: []string{"stops"}},
	{id: "stops_stop_id_unique", table: "stops", field: "stop_id", run: standard.StopIdUnique, columns: []string{"stop_id"}, required: []string{"stops"}},
	{id: "stops_stop_lat_valid", table: "stops", field: "stop_lat", run: standard.StopLatValid, columns: []string{"stop_lat"}, required: []string{"stops"}},
	{id: "stops_stop_lon_valid", table: "stops", field: "stop_lon", run: standard.StopLonValid, columns: []string{"stop_lon"}, required: []string{"stops"}},
	{id: "stops_stop_timezone_valid", table: "stops", field: "stop_timezone", run: standard.StopTimezoneValid, columns: []string{"stop_timezone"}, required: []string{"stops"}},
	{id: "stops_stop_url_valid", table: "stops", field: "stop_url", run: standard.StopUrlValid, columns: []string{"stop_url"}, required: []string{"stops"}},
	{id: "stops_wheelchair_boarding_allowed", table: "stops", field: "wheelchair_boarding", run: standard.WheelchairBoardingAllowed, columns: []string{"wheelchair_boarding"}, required: []string{"stops"}},
	{id: "stops_wheelchair_boarding_valid", table: "stops", field: "wheelchair_boarding", run: standard.WheelchairBoardingValid, columns: []string{"wheelchair_boarding"}, required: []string{"stops"}},
	{id: "transfers_from_route_id_foreign", table: "transfers", field: "from_route_id", run: standard.FromRouteIdForeign, columns: []string{"from_route_id", "from_trip_id"}, required: []string{"transfers", "routes", "trips"}},
	{id: "transfers_from_stop_id_foreign", table: "transfers", field: "from_stop_id", run: standard.TransfersFromStopIdForeign, columns: []string{"from_stop_id", "transfer_type"}, required: []string{"transfers", "stops"}},
	{id: "transfers_from_trip_id_foreign", table: "transfers", field: "from_trip_id", run: standard.FromTripIdForeign, columns: []string{"from_trip_id", "from_route_id"}, required: []string{"transfers", "trips"}},
	{id: "transfers_min_transfer_time_valid", table: "transfers", field: "min_transfer_time", run: standard.MinTransferTimeValid, columns: []string{"min_transfer_time"}, required: []string{"transfers"}},
	{id: "transfers_to_route_id_foreign", table: "transfers", field: "to_route_id", run: standard.ToRouteIdForeign, columns: []string{"to_route_id", "to_trip_id"}, required: []string{"transfers", "routes", "trips"}},
	{id: "transfers_to_stop_id_foreign", table: "transfers", field: "to_stop_id", run: standard.TransfersToStopIdForeign, columns: []string{"to_stop_id", "transfer_type", "from_stop_id"}, required: []string{"transfers", "stops"}},
	{id: "transfers_to_trip_id_foreign", table: "transfers", field: "to_trip_id", run: standard.ToTripIdForeign, columns: []string{"to_trip_id", "to_route_id"}, required: []string{"transfers", "trips"}},
	{id: "transfers_transfer_type_valid", table: "transfers", field: "transfer_type", run: standard.TransferTypeValid, columns: []string{"transfer_type"}, required: []string{"transfers"}},
	{id: "trips_bikes_allowed_valid", table: "trips", field: "bikes_allowed", run: standard.BikesAllowedValid, columns: []string{"bikes_allowed"}, required: []string{"trips"}},
	{id: "trips_direction_id_valid", table: "trips", field: "direction_id", run: standard.DirectionIdValid, columns: []string{"direction_id"}, required: []string{"trips"}},
	{id: "trips_route_id_foreign", table: "trips", field: "route_id", run: standard.TripsRouteIdForeign, columns: []string{"route_id"}, required: []string{"trips", "routes"}},
	{id: "trips_service_id_foreign", table: "trips", field: "service_id", run: standard.TripsServiceIdForeign, columns: []string{"service_id"}, required: []string{"trips", "calendar"}},
	{id: "trips_shape_id_foreign", table: "trips", field: "shape_id", run: standard.ShapeIdForeign, columns: []string{"shape_id"}, required: []string{"trips", "shapes"}},
	{id: "trips_trip_id_unique", table: "trips", field: "trip_id", run: standard.TripIdUnique, columns: []string{"trip_id"}, required: []string{"trips"}},
	{id: "trips_wheelchair_accessible_valid", table: "trips", field: "wheelchair_accessible", run: standard.TripsWheelchairAccessibleValid, columns: []string{"wheelchair_accessible"}, required: []string{"trips"}},
	{id: "vehicles_agency_id_foreign", table: "vehicles", field: "agency_id", run: standard.VehiclesAgencyIdForeign, columns: []string{"agency_id"}, required: []string{"vehicles", "agency"}},
	{id: "vehicles_bicycles_capacity_valid", table: "vehicles", field: "bicycles_capacity", run: standard.BicyclesCapacityValid, columns: []string{"bicycles_capacity"}, required: []string{"vehicles"}},
	{id: "vehicles_car_capacity_valid", table: "vehicles", field: "car_capacity", run: standard.CarCapacityValid, columns: []string{"car_capacity"}, required: []string{"vehicles"}},
	{id: "vehicles_emission_valid", table: "vehicles", field: "emission", run: standard.EmissionValid, columns: []string{"emission"}, required: []string{"vehicles"}},
	{id: "vehicles_propulsion_valid", table: "vehicles", field: "propulsion", run: standard.PropulsionValid, columns: []string{"propulsion"}, required: []string{"vehicles"}},
	{id: "vehicles_registration_date_valid", table: "vehicles", field: "registration_date", run: standard.RegistrationDateValid, columns: []string{"registration_date"}, required: []string{"vehicles"}},
	{id: "vehicles_total_capacity_valid", table: "vehicles", field: "total_capacity", run: standard.TotalCapacityValid, columns: []string{"total_capacity"}, required: []string{"vehicles"}},
	{id: "vehicles_vehicle_id_unique", table: "vehicles", field: "vehicle_id", run: standard.VehicleIdUnique, columns: []string{"vehicle_id"}, required: []string{"vehicles"}},
	{id: "vehicles_vehicle_type_valid", table: "vehicles", field: "vehicle_type", run: standard.VehicleTypeValid, columns: []string{"vehicle_type"}, required: []string{"vehicles"}},
	{id: "vehicles_wheelchair_accessible_valid", table: "vehicles", field: "wheelchair_accessible", run: standard.VehiclesWheelchairAccessibleValid, columns: []string{"wheelchair_accessible"}, required: []string{"vehicles"}},
}

func TestStandardRuntimeContracts(t *testing.T) {
	for _, check := range migratedChecks {
		t.Run(check.id, func(t *testing.T) {
			t.Run("empty_input", func(t *testing.T) {
				db := fixture(t, check.table, check.columns, nil, nil)
				for _, table := range check.required {
					if table != check.table {
						addTable(t, db, table, []string{"unrelated"}, nil, nil)
					}
				}
				ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
				assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR)
			})
			t.Run("missing_source", func(t *testing.T) {
				ctx, findings := runCheck(t, check, emptyDatabase(t), rules.RuleContext{Severity: rules.SEVERITY_ERROR})
				if !ctx.Skipped || ctx.Failed || len(findings) != 0 {
					t.Fatalf("missing source must skip: ctx=%+v findings=%+v", ctx, findings)
				}
			})
			t.Run("operational_error", func(t *testing.T) {
				db := emptyDatabase(t)
				if err := db.Close(); err != nil {
					t.Fatal(err)
				}
				collector := &testutil.Collector{}
				ctx := context.NewRuleContext(check.id, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR}, collector)
				if err := check.run(ctx); err == nil || len(collector.Messages) != 0 {
					t.Fatalf("closed database must return an error without findings: %v", err)
				}
			})
			t.Run("invalid_context", func(t *testing.T) {
				collector := &testutil.Collector{}
				for name, ctx := range map[string]*context.ValidationContext{
					"nil":              nil,
					"missing_database": context.NewRuleContext(check.id, nil, rules.RuleContext{Severity: rules.SEVERITY_ERROR}, collector),
					"missing_receiver": context.NewRuleContext(check.id, emptyDatabase(t), rules.RuleContext{Severity: rules.SEVERITY_ERROR}, nil),
				} {
					t.Run(name, func(t *testing.T) {
						if err := check.run(ctx); err == nil {
							t.Fatal("expected invalid context error")
						}
					})
				}
				if len(collector.Messages) != 0 {
					t.Fatal("invalid contexts must not emit findings")
				}
			})
		})
	}
}
