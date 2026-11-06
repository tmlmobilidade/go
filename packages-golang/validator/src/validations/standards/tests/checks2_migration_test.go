package standard_test

import (
	"database/sql"
	"path/filepath"
	"reflect"
	"slices"
	"strings"
	"testing"

	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/validations"
	reference "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
	migrated "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks2"
	testutil "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/utils"
	_ "modernc.org/sqlite"
)

type migratedCheck struct {
	id        string
	table     string
	columns   []string
	migrated  validationTypes.Check
	reference validationTypes.Check
}

var migratedChecks = []migratedCheck{
	{id: "agency_email_field", table: "agency", columns: []string{"agency_email"}, migrated: migrated.AgencyEmailField, reference: reference.AgencyEmailField},
	{id: "agency_fare_url_field", table: "agency", columns: []string{"agency_fare_url"}, migrated: migrated.AgencyFareUrlField, reference: reference.AgencyFareUrlField},
	{id: "agency_id_field", table: "agency", columns: []string{"agency_id"}, migrated: migrated.AgencyAgencyIdField, reference: reference.AgencyAgencyIdField},
	{id: "agency_lang_field", table: "agency", columns: []string{"agency_lang"}, migrated: migrated.AgencyLangField, reference: reference.AgencyLangField},
	{id: "agency_name_field", table: "agency", columns: []string{"agency_name"}, migrated: migrated.AgencyNameField, reference: reference.AgencyNameField},
	{id: "agency_phone_field", table: "agency", columns: []string{"agency_phone"}, migrated: migrated.AgencyPhoneField, reference: reference.AgencyPhoneField},
	{id: "agency_timezone_field", table: "agency", columns: []string{"agency_timezone"}, migrated: migrated.AgencyTimezoneField, reference: reference.AgencyTimezoneField},
	{id: "agency_url_field", table: "agency", columns: []string{"agency_url"}, migrated: migrated.AgencyUrlField, reference: reference.AgencyUrlField},
	{id: "calendar_dates_date_field", table: "calendar_dates", columns: []string{"date"}, migrated: migrated.DateField, reference: reference.DateField},
	{id: "calendar_dates_exception_type_field", table: "calendar_dates", columns: []string{"exception_type"}, migrated: migrated.ExceptionTypeField, reference: reference.ExceptionTypeField},
	{id: "calendar_dates_service_id_field", table: "calendar_dates", columns: []string{"service_id"}, migrated: migrated.CalendarDatesServiceIdField, reference: reference.CalendarDatesServiceIdField},
	{id: "calendar_end_date_field", table: "calendar", columns: []string{"end_date"}, migrated: migrated.EndDateValidation, reference: reference.EndDateValidation},
	{id: "calendar_friday_field", table: "calendar", columns: []string{"friday"}, migrated: migrated.FridayValidation, reference: reference.FridayValidation},
	{id: "calendar_monday_field", table: "calendar", columns: []string{"monday"}, migrated: migrated.MondayValidation, reference: reference.MondayValidation},
	{id: "calendar_saturday_field", table: "calendar", columns: []string{"saturday"}, migrated: migrated.SaturdayValidation, reference: reference.SaturdayValidation},
	{id: "calendar_service_id_field", table: "calendar", columns: []string{"service_id"}, migrated: migrated.ServiceIdValidation, reference: reference.ServiceIdValidation},
	{id: "calendar_start_date_field", table: "calendar", columns: []string{"start_date"}, migrated: migrated.StartDateValidation, reference: reference.StartDateValidation},
	{id: "calendar_sunday_field", table: "calendar", columns: []string{"sunday"}, migrated: migrated.SundayValidation, reference: reference.SundayValidation},
	{id: "calendar_thursday_field", table: "calendar", columns: []string{"thursday"}, migrated: migrated.ThursdayValidation, reference: reference.ThursdayValidation},
	{id: "calendar_tuesday_field", table: "calendar", columns: []string{"tuesday"}, migrated: migrated.TuesdayValidation, reference: reference.TuesdayValidation},
	{id: "calendar_wednesday_field", table: "calendar", columns: []string{"wednesday"}, migrated: migrated.WednesdayValidation, reference: reference.WednesdayValidation},
	{id: "fare_attributes_agency_id_field", table: "fare_attributes", columns: []string{"agency_id"}, migrated: migrated.FareAttributesAgencyIdField, reference: reference.FareAttributesAgencyIdField},
	{id: "fare_attributes_currency_type_field", table: "fare_attributes", columns: []string{"currency_type"}, migrated: migrated.CurrencyTypeField, reference: reference.CurrencyTypeField},
	{id: "fare_attributes_fare_id_field", table: "fare_attributes", columns: []string{"fare_id"}, migrated: migrated.FareAttributesFareIdField, reference: reference.FareAttributesFareIdField},
	{id: "fare_attributes_payment_method_field", table: "fare_attributes", columns: []string{"payment_method"}, migrated: migrated.PaymentMethodField, reference: reference.PaymentMethodField},
	{id: "fare_attributes_price_field", table: "fare_attributes", columns: []string{"price"}, migrated: migrated.PriceField, reference: reference.PriceField},
	{id: "fare_attributes_transfer_duration_field", table: "fare_attributes", columns: []string{"transfer_duration"}, migrated: migrated.TransferDurationField, reference: reference.TransferDurationField},
	{id: "fare_attributes_transfers_field", table: "fare_attributes", columns: []string{"transfers"}, migrated: migrated.TransfersField, reference: reference.TransfersField},
	{id: "fare_rules_contains_id_field", table: "fare_rules", columns: []string{"contains_id"}, migrated: migrated.ContainsIdField, reference: reference.ContainsIdField},
	{id: "fare_rules_destination_id_field", table: "fare_rules", columns: []string{"destination_id"}, migrated: migrated.DestinationIdField, reference: reference.DestinationIdField},
	{id: "fare_rules_fare_id_field", table: "fare_rules", columns: []string{"fare_id"}, migrated: migrated.FareRulesFareIdField, reference: reference.FareRulesFareIdField},
	{id: "fare_rules_origin_id_field", table: "fare_rules", columns: []string{"origin_id"}, migrated: migrated.OriginIdField, reference: reference.OriginIdField},
	{id: "fare_rules_route_id_field", table: "fare_rules", columns: []string{"route_id"}, migrated: migrated.FareRulesRouteIdField, reference: reference.FareRulesRouteIdField},
	{id: "feed_info_default_lang_field", table: "feed_info", columns: []string{"default_lang"}, migrated: migrated.DefaultLangField, reference: reference.DefaultLangField},
	{id: "feed_info_feed_contact_email_field", table: "feed_info", columns: []string{"feed_contact_email"}, migrated: migrated.FeedContactEmailField, reference: reference.FeedContactEmailField},
	{id: "feed_info_feed_contact_url_field", table: "feed_info", columns: []string{"feed_contact_url"}, migrated: migrated.FeedContactUrlField, reference: reference.FeedContactUrlField},
	{id: "feed_info_feed_end_date_field", table: "feed_info", columns: []string{"feed_end_date"}, migrated: migrated.FeedEndDateField, reference: reference.FeedEndDateField},
	{id: "feed_info_feed_lang_field", table: "feed_info", columns: []string{"feed_lang"}, migrated: migrated.FeedLangField, reference: reference.FeedLangField},
	{id: "feed_info_feed_publisher_name_field", table: "feed_info", columns: []string{"feed_publisher_name"}, migrated: migrated.FeedPublisherNameField, reference: reference.FeedPublisherNameField},
	{id: "feed_info_feed_publisher_url_field", table: "feed_info", columns: []string{"feed_publisher_url"}, migrated: migrated.FeedPublisherUrlField, reference: reference.FeedPublisherUrlField},
	{id: "feed_info_feed_start_date_field", table: "feed_info", columns: []string{"feed_start_date"}, migrated: migrated.FeedStartDateField, reference: reference.FeedStartDateField},
	{id: "feed_info_feed_version_field", table: "feed_info", columns: []string{"feed_version"}, migrated: migrated.FeedVersionField, reference: reference.FeedVersionField},
	{id: "frequencies_end_time_field", table: "frequencies", columns: []string{"end_time"}, migrated: migrated.EndTimeField, reference: reference.EndTimeField},
	{id: "frequencies_exact_times_field", table: "frequencies", columns: []string{"exact_times"}, migrated: migrated.ExactTimesField, reference: reference.ExactTimesField},
	{id: "frequencies_headway_secs_field", table: "frequencies", columns: []string{"headway_secs"}, migrated: migrated.HeadwaySecsField, reference: reference.HeadwaySecsField},
	{id: "frequencies_start_time_field", table: "frequencies", columns: []string{"start_time"}, migrated: migrated.StartTimeField, reference: reference.StartTimeField},
	{id: "frequencies_trip_id_field", table: "frequencies", columns: []string{"trip_id"}, migrated: migrated.FrequenciesTripIdField, reference: reference.FrequenciesTripIdField},
	{id: "levels_level_id_field", table: "levels", columns: []string{"level_id"}, migrated: migrated.LevelsLevelIdField, reference: reference.LevelsLevelIdField},
	{id: "levels_level_index_field", table: "levels", columns: []string{"level_index"}, migrated: migrated.LevelIndexField, reference: reference.LevelIndexField},
	{id: "levels_level_name_field", table: "levels", columns: []string{"level_name"}, migrated: migrated.LevelNameField, reference: reference.LevelNameField},
	{id: "pathways_from_stop_id_field", table: "pathways", columns: []string{"from_stop_id"}, migrated: migrated.PathwaysFromStopIdField, reference: reference.PathwaysFromStopIdField},
	{id: "pathways_is_bidirectional_field", table: "pathways", columns: []string{"is_bidirectional"}, migrated: migrated.IsBidirectionalField, reference: reference.IsBidirectionalField},
	{id: "pathways_length_field", table: "pathways", columns: []string{"length", "pathway_mode"}, migrated: migrated.LengthField, reference: reference.LengthField},
	{id: "pathways_max_slope_field", table: "pathways", columns: []string{"max_slope", "pathway_mode"}, migrated: migrated.MaxSlopeField, reference: reference.MaxSlopeField},
	{id: "pathways_min_width_field", table: "pathways", columns: []string{"min_width"}, migrated: migrated.MinWidthField, reference: reference.MinWidthField},
	{id: "pathways_pathway_id_field", table: "pathways", columns: []string{"pathway_id"}, migrated: migrated.PathwayIdField, reference: reference.PathwayIdField},
	{id: "pathways_pathway_mode_field", table: "pathways", columns: []string{"pathway_mode"}, migrated: migrated.PathwayModeField, reference: reference.PathwayModeField},
	{id: "pathways_reversed_signposted_as_field", table: "pathways", columns: []string{"reversed_signposted_as"}, migrated: migrated.ReversedSignpostedAsField, reference: reference.ReversedSignpostedAsField},
	{id: "pathways_signposted_as_field", table: "pathways", columns: []string{"signposted_as"}, migrated: migrated.SignpostedAsField, reference: reference.SignpostedAsField},
	{id: "pathways_stair_count_field", table: "pathways", columns: []string{"stair_count"}, migrated: migrated.StairCountField, reference: reference.StairCountField},
	{id: "pathways_to_stop_id_field", table: "pathways", columns: []string{"to_stop_id"}, migrated: migrated.PathwaysToStopIdField, reference: reference.PathwaysToStopIdField},
	{id: "pathways_traversal_time_field", table: "pathways", columns: []string{"traversal_time"}, migrated: migrated.TraversalTimeField, reference: reference.TraversalTimeField},
	{id: "rider_categories_eligibility_url_field", table: "rider_categories", columns: []string{"eligibility_url"}, migrated: migrated.EligibilityUrlField, reference: reference.EligibilityUrlField},
	{id: "rider_categories_is_default_fare_category_field", table: "rider_categories", columns: []string{"is_default_fare_category"}, migrated: migrated.IsDefaultFareCategoryField, reference: reference.IsDefaultFareCategoryField},
	{id: "rider_categories_rider_category_id_field", table: "rider_categories", columns: []string{"rider_category_id"}, migrated: migrated.RiderCategoryIdField, reference: reference.RiderCategoryIdField},
	{id: "rider_categories_rider_category_name_field", table: "rider_categories", columns: []string{"rider_category_name"}, migrated: migrated.RiderCategoryNameField, reference: reference.RiderCategoryNameField},
	{id: "routes_agency_id_field", table: "routes", columns: []string{"agency_id"}, migrated: migrated.RoutesAgencyIdField, reference: reference.RoutesAgencyIdField},
	{id: "routes_continuous_drop_off_field", table: "routes", columns: []string{"continuous_drop_off"}, migrated: migrated.RoutesContinuousDropOffField, reference: reference.RoutesContinuousDropOffField},
	{id: "routes_continuous_pickup_field", table: "routes", columns: []string{"continuous_pickup"}, migrated: migrated.RoutesContinuousPickupField, reference: reference.RoutesContinuousPickupField},
	{id: "routes_line_id_field", table: "routes", columns: []string{"line_id"}, migrated: migrated.LineIdField, reference: reference.LineIdField},
	{id: "routes_line_long_name_field", table: "routes", columns: []string{"line_long_name"}, migrated: migrated.LineLongNameField, reference: reference.LineLongNameField},
	{id: "routes_line_short_name_field", table: "routes", columns: []string{"line_short_name"}, migrated: migrated.LineShortNameField, reference: reference.LineShortNameField},
	{id: "routes_network_id_field", table: "routes", columns: []string{"network_id"}, migrated: migrated.NetworkIdField, reference: reference.NetworkIdField},
	{id: "routes_path_type_field", table: "routes", columns: []string{"path_type"}, migrated: migrated.PathTypeField, reference: reference.PathTypeField},
	{id: "routes_route_color_field", table: "routes", columns: []string{"route_color"}, migrated: migrated.RouteColorField, reference: reference.RouteColorField},
	{id: "routes_route_desc_field", table: "routes", columns: []string{"route_desc"}, migrated: migrated.RouteDescField, reference: reference.RouteDescField},
	{id: "routes_route_id_field", table: "routes", columns: []string{"route_id"}, migrated: migrated.RoutesRouteIdField, reference: reference.RoutesRouteIdField},
	{id: "routes_route_long_name_field", table: "routes", columns: []string{"route_long_name"}, migrated: migrated.RouteLongNameField, reference: reference.RouteLongNameField},
	{id: "routes_route_short_name_field", table: "routes", columns: []string{"route_short_name"}, migrated: migrated.RouteShortNameField, reference: reference.RouteShortNameField},
	{id: "routes_route_sort_order_field", table: "routes", columns: []string{"route_sort_order"}, migrated: migrated.RouteSortOrderField, reference: reference.RouteSortOrderField},
	{id: "routes_route_text_color_field", table: "routes", columns: []string{"route_text_color"}, migrated: migrated.RouteTextColorField, reference: reference.RouteTextColorField},
	{id: "routes_route_type_field", table: "routes", columns: []string{"route_type"}, migrated: migrated.RouteTypeField, reference: reference.RouteTypeField},
	{id: "routes_route_url_field", table: "routes", columns: []string{"route_url"}, migrated: migrated.RouteUrlField, reference: reference.RouteUrlField},
	{id: "shapes_shape_dist_traveled_field", table: "shapes", columns: []string{"shape_dist_traveled"}, migrated: migrated.ShapesShapeDistTraveledField, reference: reference.ShapesShapeDistTraveledField},
	{id: "shapes_shape_id_field", table: "shapes", columns: []string{"shape_id"}, migrated: migrated.ShapesShapeIdField, reference: reference.ShapesShapeIdField},
	{id: "shapes_shape_pt_lat_field", table: "shapes", columns: []string{"shape_pt_lat"}, migrated: migrated.ShapePtLatField, reference: reference.ShapePtLatField},
	{id: "shapes_shape_pt_lon_field", table: "shapes", columns: []string{"shape_pt_lon"}, migrated: migrated.ShapePtLonField, reference: reference.ShapePtLonField},
	{id: "shapes_shape_pt_sequence_field", table: "shapes", columns: []string{"shape_pt_sequence"}, migrated: migrated.ShapePtSequenceField, reference: reference.ShapePtSequenceField},
	{id: "stop_times_arrival_time_field", table: "stop_times", columns: []string{"arrival_time"}, migrated: migrated.ArrivalTimeField, reference: reference.ArrivalTimeField},
	{id: "stop_times_continuous_drop_off_field", table: "stop_times", columns: []string{"continuous_drop_off"}, migrated: migrated.StopTimesContinuousDropOffField, reference: reference.StopTimesContinuousDropOffField},
	{id: "stop_times_continuous_pickup_field", table: "stop_times", columns: []string{"continuous_pickup"}, migrated: migrated.StopTimesContinuousPickupField, reference: reference.StopTimesContinuousPickupField},
	{id: "stop_times_departure_time_field", table: "stop_times", columns: []string{"departure_time"}, migrated: migrated.DepartureTimeField, reference: reference.DepartureTimeField},
	{id: "stop_times_drop_off_booking_rule_id_field", table: "stop_times", columns: []string{"drop_off_booking_rule_id"}, migrated: migrated.DropOffBookingRuleIdField, reference: reference.DropOffBookingRuleIdField},
	{id: "stop_times_drop_off_type_field", table: "stop_times", columns: []string{"drop_off_type"}, migrated: migrated.DropOffTypeField, reference: reference.DropOffTypeField},
	{id: "stop_times_end_pickup_drop_off_window_field", table: "stop_times", columns: []string{"end_pickup_drop_off_window", "arrival_time", "departure_time"}, migrated: migrated.EndPickupDropOffWindowField, reference: reference.EndPickupDropOffWindowField},
	{id: "stop_times_location_group_id_field", table: "stop_times", columns: []string{"location_group_id"}, migrated: migrated.LocationGroupIdField, reference: reference.LocationGroupIdField},
	{id: "stop_times_pickup_booking_rule_id_field", table: "stop_times", columns: []string{"pickup_booking_rule_id"}, migrated: migrated.PickupBookingRuleIdField, reference: reference.PickupBookingRuleIdField},
	{id: "stop_times_pickup_type_field", table: "stop_times", columns: []string{"pickup_type"}, migrated: migrated.PickupTypeField, reference: reference.PickupTypeField},
	{id: "stop_times_shape_dist_traveled_field", table: "stop_times", columns: []string{"shape_dist_traveled"}, migrated: migrated.StopTimesShapeDistTraveledField, reference: reference.StopTimesShapeDistTraveledField},
	{id: "stop_times_start_pickup_drop_off_window_field", table: "stop_times", columns: []string{"start_pickup_drop_off_window", "arrival_time", "departure_time"}, migrated: migrated.StartPickupDropOffWindowField, reference: reference.StartPickupDropOffWindowField},
	{id: "stop_times_stop_headsign_field", table: "stop_times", columns: []string{"stop_headsign"}, migrated: migrated.StopHeadsignField, reference: reference.StopHeadsignField},
	{id: "stop_times_stop_id_field", table: "stop_times", columns: []string{"stop_id"}, migrated: migrated.StopTimesStopIdField, reference: reference.StopTimesStopIdField},
	{id: "stop_times_timepoint_field", table: "stop_times", columns: []string{"timepoint"}, migrated: migrated.TimepointField, reference: reference.TimepointField},
	{id: "stop_times_trip_id_field", table: "stop_times", columns: []string{"trip_id"}, migrated: migrated.StopTimesTripIdField, reference: reference.StopTimesTripIdField},
	{id: "stops_has_bench_field", table: "stops", columns: []string{"has_bench"}, migrated: migrated.HasBenchField, reference: reference.HasBenchField},
	{id: "stops_has_network_map_field", table: "stops", columns: []string{"has_network_map"}, migrated: migrated.HasNetworkMapField, reference: reference.HasNetworkMapField},
	{id: "stops_has_pip_real_time_field", table: "stops", columns: []string{"has_pip_real_time"}, migrated: migrated.HasPipRealTimeField, reference: reference.HasPipRealTimeField},
	{id: "stops_has_schedules_field", table: "stops", columns: []string{"has_schedules"}, migrated: migrated.HasSchedulesField, reference: reference.HasSchedulesField},
	{id: "stops_has_shelter_field", table: "stops", columns: []string{"has_shelter"}, migrated: migrated.HasShelterField, reference: reference.HasShelterField},
	{id: "stops_has_stop_sign_field", table: "stops", columns: []string{"has_stop_sign"}, migrated: migrated.HasStopSignField, reference: reference.HasStopSignField},
	{id: "stops_has_tariffs_information_field", table: "stops", columns: []string{"has_tariffs_information"}, migrated: migrated.HasTariffsInformationField, reference: reference.HasTariffsInformationField},
	{id: "stops_level_id_field", table: "stops", columns: []string{"level_id"}, migrated: migrated.StopsLevelIdField, reference: reference.StopsLevelIdField},
	{id: "stops_location_type_field", table: "stops", columns: []string{"location_type"}, migrated: migrated.LocationTypeField, reference: reference.LocationTypeField},
	{id: "stops_municipality_id_field", table: "stops", columns: []string{"municipality_id"}, migrated: migrated.MunicipalityIdField, reference: reference.MunicipalityIdField},
	{id: "stops_parent_station_field", table: "stops", columns: []string{"parent_station"}, migrated: migrated.ParentStationField, reference: reference.ParentStationField},
	{id: "stops_parish_id_field", table: "stops", columns: []string{"parish_id"}, migrated: migrated.ParishIdField, reference: reference.ParishIdField},
	{id: "stops_platform_code_field", table: "stops", columns: []string{"platform_code"}, migrated: migrated.PlatformCodeField, reference: reference.PlatformCodeField},
	{id: "stops_public_visible_field", table: "stops", columns: []string{"public_visible"}, migrated: migrated.PublicVisibleField, reference: reference.PublicVisibleField},
	{id: "stops_region_id_field", table: "stops", columns: []string{"region_id"}, migrated: migrated.RegionIdField, reference: reference.RegionIdField},
	{id: "stops_shelter_code_field", table: "stops", columns: []string{"shelter_code"}, migrated: migrated.ShelterCodeField, reference: reference.ShelterCodeField},
	{id: "stops_shelter_maintainer_field", table: "stops", columns: []string{"shelter_maintainer"}, migrated: migrated.ShelterMaintainerField, reference: reference.ShelterMaintainerField},
	{id: "stops_stop_access_field", table: "stops", columns: []string{"stop_access"}, migrated: migrated.StopAccessField, reference: reference.StopAccessField},
	{id: "stops_stop_code_field", table: "stops", columns: []string{"stop_code"}, migrated: migrated.StopCodeField, reference: reference.StopCodeField},
	{id: "stops_stop_desc_field", table: "stops", columns: []string{"stop_desc"}, migrated: migrated.StopDescField, reference: reference.StopDescField},
	{id: "stops_stop_id_field", table: "stops", columns: []string{"stop_id"}, migrated: migrated.StopsStopIdField, reference: reference.StopsStopIdField},
	{id: "stops_stop_lat_field", table: "stops", columns: []string{"stop_lat"}, migrated: migrated.StopLatField, reference: reference.StopLatField},
	{id: "stops_stop_lon_field", table: "stops", columns: []string{"stop_lon"}, migrated: migrated.StopLonField, reference: reference.StopLonField},
	{id: "stops_stop_name_field", table: "stops", columns: []string{"stop_name"}, migrated: migrated.StopNameField, reference: reference.StopNameField},
	{id: "stops_stop_short_name_field", table: "stops", columns: []string{"stop_short_name"}, migrated: migrated.StopShortNameField, reference: reference.StopShortNameField},
	{id: "stops_stop_timezone_field", table: "stops", columns: []string{"stop_timezone"}, migrated: migrated.StopTimezoneField, reference: reference.StopTimezoneField},
	{id: "stops_stop_url_field", table: "stops", columns: []string{"stop_url"}, migrated: migrated.StopUrlField, reference: reference.StopUrlField},
	{id: "stops_tts_stop_name_field", table: "stops", columns: []string{"tts_stop_name"}, migrated: migrated.TtsStopNameField, reference: reference.TtsStopNameField},
	{id: "stops_wheelchair_boarding_field", table: "stops", columns: []string{"wheelchair_boarding"}, migrated: migrated.WheelchairBoardingField, reference: reference.WheelchairBoardingField},
	{id: "stops_zone_id_field", table: "stops", columns: []string{"zone_id"}, migrated: migrated.ZoneIdField, reference: reference.ZoneIdField},
	{id: "transfers_from_route_id_field", table: "transfers", columns: []string{"from_route_id", "from_trip_id"}, migrated: migrated.FromRouteIdField, reference: reference.FromRouteIdField},
	{id: "transfers_from_stop_id_field", table: "transfers", columns: []string{"from_stop_id", "transfer_type"}, migrated: migrated.TransfersFromStopIdField, reference: reference.TransfersFromStopIdField},
	{id: "transfers_from_trip_id_field", table: "transfers", columns: []string{"from_trip_id", "transfer_type"}, migrated: migrated.FromTripIdField, reference: reference.FromTripIdField},
	{id: "transfers_min_transfer_time_field", table: "transfers", columns: []string{"min_transfer_time"}, migrated: migrated.MinTransferTimeField, reference: reference.MinTransferTimeField},
	{id: "transfers_to_route_id_field", table: "transfers", columns: []string{"to_route_id", "to_trip_id"}, migrated: migrated.ToRouteIdField, reference: reference.ToRouteIdField},
	{id: "transfers_to_stop_id_field", table: "transfers", columns: []string{"to_stop_id", "transfer_type"}, migrated: migrated.TransfersToStopIdField, reference: reference.TransfersToStopIdField},
	{id: "transfers_to_trip_id_field", table: "transfers", columns: []string{"to_trip_id", "transfer_type"}, migrated: migrated.ToTripIdField, reference: reference.ToTripIdField},
	{id: "transfers_transfer_type_field", table: "transfers", columns: []string{"transfer_type"}, migrated: migrated.TransferTypeField, reference: reference.TransferTypeField},
	{id: "trips_bikes_allowed_field", table: "trips", columns: []string{"bikes_allowed"}, migrated: migrated.BikesAllowedField, reference: reference.BikesAllowedField},
	{id: "trips_block_id_field", table: "trips", columns: []string{"block_id"}, migrated: migrated.BlockIdField, reference: reference.BlockIdField},
	{id: "trips_direction_id_field", table: "trips", columns: []string{"direction_id"}, migrated: migrated.DirectionIdField, reference: reference.DirectionIdField},
	{id: "trips_pattern_id_field", table: "trips", columns: []string{"pattern_id"}, migrated: migrated.PatternIdField, reference: reference.PatternIdField},
	{id: "trips_route_id_field", table: "trips", columns: []string{"route_id"}, migrated: migrated.TripsRouteIdField, reference: reference.TripsRouteIdField},
	{id: "trips_service_id_field", table: "trips", columns: []string{"service_id"}, migrated: migrated.TripsServiceIdField, reference: reference.TripsServiceIdField},
	{id: "trips_shape_id_field", table: "trips", columns: []string{"shape_id"}, migrated: migrated.TripsShapeIdField, reference: reference.TripsShapeIdField},
	{id: "trips_trip_headsign_field", table: "trips", columns: []string{"trip_headsign"}, migrated: migrated.TripHeadsignField, reference: reference.TripHeadsignField},
	{id: "trips_trip_id_field", table: "trips", columns: []string{"trip_id"}, migrated: migrated.TripsTripIdField, reference: reference.TripsTripIdField},
	{id: "trips_trip_short_name_field", table: "trips", columns: []string{"trip_short_name"}, migrated: migrated.TripShortNameField, reference: reference.TripShortNameField},
	{id: "trips_wheelchair_accessible_field", table: "trips", columns: []string{"wheelchair_accessible"}, migrated: migrated.TripsWheelchairAccessibleField, reference: reference.TripsWheelchairAccessibleField},
	{id: "vehicles_agency_id_field", table: "vehicles", columns: []string{"agency_id"}, migrated: migrated.VehiclesAgencyIdField, reference: reference.VehiclesAgencyIdField},
	{id: "vehicles_bicycles_capacity_field", table: "vehicles", columns: []string{"bicycles_capacity"}, migrated: migrated.BicyclesCapacityField, reference: reference.BicyclesCapacityField},
	{id: "vehicles_car_capacity_field", table: "vehicles", columns: []string{"car_capacity"}, migrated: migrated.CarCapacityField, reference: reference.CarCapacityField},
	{id: "vehicles_emission_field", table: "vehicles", columns: []string{"emission"}, migrated: migrated.EmissionField, reference: reference.EmissionField},
	{id: "vehicles_make_field", table: "vehicles", columns: []string{"make"}, migrated: migrated.MakeField, reference: reference.MakeField},
	{id: "vehicles_model_field", table: "vehicles", columns: []string{"model"}, migrated: migrated.ModelField, reference: reference.ModelField},
	{id: "vehicles_propulsion_field", table: "vehicles", columns: []string{"propulsion"}, migrated: migrated.PropulsionField, reference: reference.PropulsionField},
	{id: "vehicles_registration_date_field", table: "vehicles", columns: []string{"registration_date"}, migrated: migrated.RegistrationDateField, reference: reference.RegistrationDateField},
	{id: "vehicles_total_capacity_field", table: "vehicles", columns: []string{"total_capacity"}, migrated: migrated.TotalCapacityField, reference: reference.TotalCapacityField},
	{id: "vehicles_vehicle_code_field", table: "vehicles", columns: []string{"vehicle_code"}, migrated: migrated.VehicleCodeField, reference: reference.VehicleCodeField},
	{id: "vehicles_vehicle_id_field", table: "vehicles", columns: []string{"vehicle_id"}, migrated: migrated.VehicleIdField, reference: reference.VehicleIdField},
	{id: "vehicles_vehicle_type_field", table: "vehicles", columns: []string{"vehicle_type"}, migrated: migrated.VehicleTypeField, reference: reference.VehicleTypeField},
	{id: "vehicles_wheelchair_accessible_field", table: "vehicles", columns: []string{"wheelchair_accessible"}, migrated: migrated.VehiclesWheelchairAccessibleField, reference: reference.VehiclesWheelchairAccessibleField},
}

// The supplied checks2 files contain field-presence checks. Compare their
// migrated behavior with the already tested callbacks without registering them.
func TestMigratedChecksPreserveFindings(t *testing.T) {
	columnsByTable := map[string][]string{}
	for _, check := range migratedChecks {
		for _, column := range check.columns {
			if !slices.Contains(columnsByTable[check.table], column) {
				columnsByTable[check.table] = append(columnsByTable[check.table], column)
			}
		}
	}
	columnsByTable["stop_times"] = append(columnsByTable["stop_times"], "location_id")

	// Use one database connection to exercise nested lookups after row cursors close.
	databases := map[string]*sql.DB{}
	missingColumns := map[string]*sql.DB{}
	for table, columns := range columnsByTable {
		databases[table] = migrationFixture(t, table, columns)
		missingColumns[table] = migrationFixture(t, table, []string{"unrelated"})
	}
	missingTable := migrationDatabase(t)
	closed := migrationDatabase(t)
	if err := closed.Close(); err != nil {
		t.Fatal(err)
	}

	for _, check := range migratedChecks {
		t.Run(check.id, func(t *testing.T) {
			for _, severity := range []rules.Severities{rules.SEVERITY_ERROR, rules.SEVERITY_WARNING, rules.SEVERITY_INFO, rules.SEVERITY_IGNORE, rules.SEVERITY_FORBIDDEN, ""} {
				name := string(severity)
				if name == "" {
					name = "unconfigured"
				}
				t.Run(name, func(t *testing.T) {
					compareMigration(t, check, databases[check.table], severity)
				})
			}
			t.Run("missing_columns", func(t *testing.T) {
				compareMigration(t, check, missingColumns[check.table], rules.SEVERITY_ERROR)
			})
			t.Run("missing_table", func(t *testing.T) {
				compareMigration(t, check, missingTable, rules.SEVERITY_ERROR)
			})
			t.Run("query_error", func(t *testing.T) {
				compareMigration(t, check, closed, rules.SEVERITY_ERROR)
			})
		})
	}
}

func compareMigration(t *testing.T, check migratedCheck, db *sql.DB, severity rules.Severities) {
	t.Helper()
	actual := &testutil.Collector{}
	expected := &testutil.Collector{}
	// A supplied ID also detects accidental reuse of hard-coded legacy rule IDs.
	id := "configured_" + check.id
	actualContext := context.NewRuleContext(id, db, rules.RuleContext{Severity: severity}, actual)
	expectedContext := context.NewRuleContext(id, db, rules.RuleContext{Severity: severity}, expected)
	actualError := check.migrated(actualContext)
	expectedError := check.reference(expectedContext)
	if (actualError == nil) != (expectedError == nil) {
		t.Fatalf("query error changed: got %v, want %v", actualError, expectedError)
	}
	if actualError != nil && actualError.Error() != expectedError.Error() {
		t.Fatalf("query error changed: got %v, want %v", actualError, expectedError)
	}
	if !reflect.DeepEqual(actual.Messages, expected.Messages) {
		t.Fatalf("findings changed:\ngot:  %+v\nwant: %+v", actual.Messages, expected.Messages)
	}
	if actualContext.Failed != expectedContext.Failed || actualContext.Skipped != expectedContext.Skipped || actualContext.FileName != expectedContext.FileName || actualContext.Field != expectedContext.Field {
		t.Fatalf("rule outcome or source changed: got %+v, want %+v", actualContext, expectedContext)
	}
	if actualContext.Source != nil || actualContext.Row != -1 {
		t.Fatalf("row state leaked into the whole-rule context: %+v", actualContext)
	}
}

func migrationDatabase(t *testing.T) *sql.DB {
	t.Helper()
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "gtfs.sqlite"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	db.SetMaxOpenConns(1)
	return db
}

func migrationFixture(t *testing.T, table string, columns []string) *sql.DB {
	t.Helper()
	db := migrationDatabase(t)
	definitions := make([]string, len(columns))
	placeholders := make([]string, len(columns))
	for index, column := range columns {
		definitions[index] = `"` + column + `" TEXT`
		placeholders[index] = "?"
	}
	if _, err := db.Exec(`CREATE TABLE "` + table + `" (` + strings.Join(definitions, ",") + `)`); err != nil {
		t.Fatal(err)
	}

	// Present, empty, NULL and sparse rows cover presence and source-index behavior.
	type sourceRow struct {
		value     any
		overrides map[string]any
	}
	rows := []sourceRow{{value: "present"}, {value: ""}, {value: nil}}
	// The conditional checks use transfer_type and pathway_mode from the same row.
	for _, kind := range []string{"0", "1", "2", "3", "4", "5", "6", "7", "invalid"} {
		rows = append(rows, sourceRow{value: "", overrides: map[string]any{"transfer_type": kind, "pathway_mode": kind}})
	}
	rows = append(rows,
		sourceRow{value: "", overrides: map[string]any{"arrival_time": "12:00:00"}},
		sourceRow{value: "", overrides: map[string]any{"departure_time": "12:00:00"}},
		sourceRow{value: "", overrides: map[string]any{"from_trip_id": "T1", "to_trip_id": "T2"}},
		sourceRow{value: "", overrides: map[string]any{"location_group_id": "G1", "stop_id": "S1", "location_id": "G1"}},
	)
	query := `INSERT INTO "` + table + `" (rowid, "` + strings.Join(columns, `","`) + `") VALUES (?,` + strings.Join(placeholders, ",") + `)`
	for index, row := range rows {
		values := []any{index*3 + 2}
		for _, column := range columns {
			value, exists := row.overrides[column]
			if !exists {
				value = row.value
			}
			values = append(values, value)
		}
		if _, err := db.Exec(query, values...); err != nil {
			t.Fatal(err)
		}
	}
	return db
}
