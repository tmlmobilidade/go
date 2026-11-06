package fields_test

import (
	"database/sql"
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/validations"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables/i18n"
	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks2"
	testutil "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/utils"
	_ "modernc.org/sqlite"
)

type fieldCheck struct {
	id              string
	table           string
	field           string
	run             validationTypes.Check
	skipForbidden   bool
	requiredMessage bool
}

var presenceChecks = []fieldCheck{
	{id: "agency_email_field", table: "agency", field: "agency_email", run: fields.AgencyEmailField, skipForbidden: true},
	{id: "agency_fare_url_field", table: "agency", field: "agency_fare_url", run: fields.AgencyFareUrlField, skipForbidden: true},
	{id: "agency_id_field", table: "agency", field: "agency_id", run: fields.AgencyAgencyIdField, skipForbidden: true},
	{id: "agency_lang_field", table: "agency", field: "agency_lang", run: fields.AgencyLangField, skipForbidden: true},
	{id: "agency_name_field", table: "agency", field: "agency_name", run: fields.AgencyNameField, skipForbidden: true},
	{id: "agency_phone_field", table: "agency", field: "agency_phone", run: fields.AgencyPhoneField, skipForbidden: true},
	{id: "agency_timezone_field", table: "agency", field: "agency_timezone", run: fields.AgencyTimezoneField, skipForbidden: true},
	{id: "agency_url_field", table: "agency", field: "agency_url", run: fields.AgencyUrlField, skipForbidden: true},
	{id: "calendar_dates_date_field", table: "calendar_dates", field: "date", run: fields.DateField, skipForbidden: true, requiredMessage: true},
	{id: "calendar_dates_exception_type_field", table: "calendar_dates", field: "exception_type", run: fields.ExceptionTypeField, skipForbidden: true, requiredMessage: true},
	{id: "calendar_dates_service_id_field", table: "calendar_dates", field: "service_id", run: fields.CalendarDatesServiceIdField, skipForbidden: true},
	{id: "calendar_end_date_field", table: "calendar", field: "end_date", run: fields.EndDateValidation, skipForbidden: true},
	{id: "calendar_friday_field", table: "calendar", field: "friday", run: fields.FridayValidation, skipForbidden: true},
	{id: "calendar_monday_field", table: "calendar", field: "monday", run: fields.MondayValidation, skipForbidden: true},
	{id: "calendar_saturday_field", table: "calendar", field: "saturday", run: fields.SaturdayValidation, skipForbidden: true},
	{id: "calendar_service_id_field", table: "calendar", field: "service_id", run: fields.ServiceIdValidation, skipForbidden: true},
	{id: "calendar_start_date_field", table: "calendar", field: "start_date", run: fields.StartDateValidation, skipForbidden: true},
	{id: "calendar_sunday_field", table: "calendar", field: "sunday", run: fields.SundayValidation, skipForbidden: true},
	{id: "calendar_thursday_field", table: "calendar", field: "thursday", run: fields.ThursdayValidation, skipForbidden: true},
	{id: "calendar_tuesday_field", table: "calendar", field: "tuesday", run: fields.TuesdayValidation, skipForbidden: true},
	{id: "calendar_wednesday_field", table: "calendar", field: "wednesday", run: fields.WednesdayValidation, skipForbidden: true},
	{id: "fare_attributes_agency_id_field", table: "fare_attributes", field: "agency_id", run: fields.FareAttributesAgencyIdField},
	{id: "fare_attributes_currency_type_field", table: "fare_attributes", field: "currency_type", run: fields.CurrencyTypeField},
	{id: "fare_attributes_fare_id_field", table: "fare_attributes", field: "fare_id", run: fields.FareAttributesFareIdField},
	{id: "fare_attributes_payment_method_field", table: "fare_attributes", field: "payment_method", run: fields.PaymentMethodField},
	{id: "fare_attributes_price_field", table: "fare_attributes", field: "price", run: fields.PriceField},
	{id: "fare_attributes_transfer_duration_field", table: "fare_attributes", field: "transfer_duration", run: fields.TransferDurationField},
	{id: "fare_attributes_transfers_field", table: "fare_attributes", field: "transfers", run: fields.TransfersField},
	{id: "fare_rules_contains_id_field", table: "fare_rules", field: "contains_id", run: fields.ContainsIdField},
	{id: "fare_rules_destination_id_field", table: "fare_rules", field: "destination_id", run: fields.DestinationIdField},
	{id: "fare_rules_fare_id_field", table: "fare_rules", field: "fare_id", run: fields.FareRulesFareIdField},
	{id: "fare_rules_origin_id_field", table: "fare_rules", field: "origin_id", run: fields.OriginIdField},
	{id: "fare_rules_route_id_field", table: "fare_rules", field: "route_id", run: fields.FareRulesRouteIdField},
	{id: "feed_info_default_lang_field", table: "feed_info", field: "default_lang", run: fields.DefaultLangField},
	{id: "feed_info_feed_contact_email_field", table: "feed_info", field: "feed_contact_email", run: fields.FeedContactEmailField},
	{id: "feed_info_feed_contact_url_field", table: "feed_info", field: "feed_contact_url", run: fields.FeedContactUrlField},
	{id: "feed_info_feed_end_date_field", table: "feed_info", field: "feed_end_date", run: fields.FeedEndDateField},
	{id: "feed_info_feed_lang_field", table: "feed_info", field: "feed_lang", run: fields.FeedLangField},
	{id: "feed_info_feed_publisher_name_field", table: "feed_info", field: "feed_publisher_name", run: fields.FeedPublisherNameField},
	{id: "feed_info_feed_publisher_url_field", table: "feed_info", field: "feed_publisher_url", run: fields.FeedPublisherUrlField},
	{id: "feed_info_feed_start_date_field", table: "feed_info", field: "feed_start_date", run: fields.FeedStartDateField},
	{id: "feed_info_feed_version_field", table: "feed_info", field: "feed_version", run: fields.FeedVersionField},
	{id: "frequencies_end_time_field", table: "frequencies", field: "end_time", run: fields.EndTimeField},
	{id: "frequencies_exact_times_field", table: "frequencies", field: "exact_times", run: fields.ExactTimesField},
	{id: "frequencies_headway_secs_field", table: "frequencies", field: "headway_secs", run: fields.HeadwaySecsField},
	{id: "frequencies_start_time_field", table: "frequencies", field: "start_time", run: fields.StartTimeField},
	{id: "frequencies_trip_id_field", table: "frequencies", field: "trip_id", run: fields.FrequenciesTripIdField},
	{id: "levels_level_id_field", table: "levels", field: "level_id", run: fields.LevelsLevelIdField},
	{id: "levels_level_index_field", table: "levels", field: "level_index", run: fields.LevelIndexField},
	{id: "levels_level_name_field", table: "levels", field: "level_name", run: fields.LevelNameField},
	{id: "pathways_from_stop_id_field", table: "pathways", field: "from_stop_id", run: fields.PathwaysFromStopIdField},
	{id: "pathways_is_bidirectional_field", table: "pathways", field: "is_bidirectional", run: fields.IsBidirectionalField},
	{id: "pathways_min_width_field", table: "pathways", field: "min_width", run: fields.MinWidthField},
	{id: "pathways_pathway_id_field", table: "pathways", field: "pathway_id", run: fields.PathwayIdField},
	{id: "pathways_pathway_mode_field", table: "pathways", field: "pathway_mode", run: fields.PathwayModeField},
	{id: "pathways_reversed_signposted_as_field", table: "pathways", field: "reversed_signposted_as", run: fields.ReversedSignpostedAsField},
	{id: "pathways_signposted_as_field", table: "pathways", field: "signposted_as", run: fields.SignpostedAsField},
	{id: "pathways_stair_count_field", table: "pathways", field: "stair_count", run: fields.StairCountField},
	{id: "pathways_to_stop_id_field", table: "pathways", field: "to_stop_id", run: fields.PathwaysToStopIdField},
	{id: "pathways_traversal_time_field", table: "pathways", field: "traversal_time", run: fields.TraversalTimeField},
	{id: "rider_categories_eligibility_url_field", table: "rider_categories", field: "eligibility_url", run: fields.EligibilityUrlField},
	{id: "rider_categories_is_default_fare_category_field", table: "rider_categories", field: "is_default_fare_category", run: fields.IsDefaultFareCategoryField},
	{id: "rider_categories_rider_category_id_field", table: "rider_categories", field: "rider_category_id", run: fields.RiderCategoryIdField},
	{id: "rider_categories_rider_category_name_field", table: "rider_categories", field: "rider_category_name", run: fields.RiderCategoryNameField},
	{id: "routes_agency_id_field", table: "routes", field: "agency_id", run: fields.RoutesAgencyIdField},
	{id: "routes_continuous_drop_off_field", table: "routes", field: "continuous_drop_off", run: fields.RoutesContinuousDropOffField},
	{id: "routes_continuous_pickup_field", table: "routes", field: "continuous_pickup", run: fields.RoutesContinuousPickupField},
	{id: "routes_line_id_field", table: "routes", field: "line_id", run: fields.LineIdField},
	{id: "routes_line_long_name_field", table: "routes", field: "line_long_name", run: fields.LineLongNameField},
	{id: "routes_line_short_name_field", table: "routes", field: "line_short_name", run: fields.LineShortNameField},
	{id: "routes_network_id_field", table: "routes", field: "network_id", run: fields.NetworkIdField},
	{id: "routes_path_type_field", table: "routes", field: "path_type", run: fields.PathTypeField},
	{id: "routes_route_color_field", table: "routes", field: "route_color", run: fields.RouteColorField},
	{id: "routes_route_desc_field", table: "routes", field: "route_desc", run: fields.RouteDescField},
	{id: "routes_route_id_field", table: "routes", field: "route_id", run: fields.RoutesRouteIdField},
	{id: "routes_route_long_name_field", table: "routes", field: "route_long_name", run: fields.RouteLongNameField},
	{id: "routes_route_short_name_field", table: "routes", field: "route_short_name", run: fields.RouteShortNameField},
	{id: "routes_route_sort_order_field", table: "routes", field: "route_sort_order", run: fields.RouteSortOrderField},
	{id: "routes_route_text_color_field", table: "routes", field: "route_text_color", run: fields.RouteTextColorField},
	{id: "routes_route_type_field", table: "routes", field: "route_type", run: fields.RouteTypeField},
	{id: "routes_route_url_field", table: "routes", field: "route_url", run: fields.RouteUrlField},
	{id: "shapes_shape_dist_traveled_field", table: "shapes", field: "shape_dist_traveled", run: fields.ShapesShapeDistTraveledField},
	{id: "shapes_shape_id_field", table: "shapes", field: "shape_id", run: fields.ShapesShapeIdField},
	{id: "shapes_shape_pt_lat_field", table: "shapes", field: "shape_pt_lat", run: fields.ShapePtLatField},
	{id: "shapes_shape_pt_lon_field", table: "shapes", field: "shape_pt_lon", run: fields.ShapePtLonField},
	{id: "shapes_shape_pt_sequence_field", table: "shapes", field: "shape_pt_sequence", run: fields.ShapePtSequenceField},
	{id: "stop_times_arrival_time_field", table: "stop_times", field: "arrival_time", run: fields.ArrivalTimeField},
	{id: "stop_times_continuous_drop_off_field", table: "stop_times", field: "continuous_drop_off", run: fields.StopTimesContinuousDropOffField, skipForbidden: true},
	{id: "stop_times_continuous_pickup_field", table: "stop_times", field: "continuous_pickup", run: fields.StopTimesContinuousPickupField, skipForbidden: true},
	{id: "stop_times_departure_time_field", table: "stop_times", field: "departure_time", run: fields.DepartureTimeField},
	{id: "stop_times_drop_off_booking_rule_id_field", table: "stop_times", field: "drop_off_booking_rule_id", run: fields.DropOffBookingRuleIdField},
	{id: "stop_times_drop_off_type_field", table: "stop_times", field: "drop_off_type", run: fields.DropOffTypeField},
	{id: "stop_times_pickup_booking_rule_id_field", table: "stop_times", field: "pickup_booking_rule_id", run: fields.PickupBookingRuleIdField},
	{id: "stop_times_pickup_type_field", table: "stop_times", field: "pickup_type", run: fields.PickupTypeField},
	{id: "stop_times_shape_dist_traveled_field", table: "stop_times", field: "shape_dist_traveled", run: fields.StopTimesShapeDistTraveledField},
	{id: "stop_times_stop_headsign_field", table: "stop_times", field: "stop_headsign", run: fields.StopHeadsignField},
	{id: "stop_times_stop_id_field", table: "stop_times", field: "stop_id", run: fields.StopTimesStopIdField},
	{id: "stop_times_timepoint_field", table: "stop_times", field: "timepoint", run: fields.TimepointField},
	{id: "stop_times_trip_id_field", table: "stop_times", field: "trip_id", run: fields.StopTimesTripIdField},
	{id: "stops_has_bench_field", table: "stops", field: "has_bench", run: fields.HasBenchField},
	{id: "stops_has_network_map_field", table: "stops", field: "has_network_map", run: fields.HasNetworkMapField},
	{id: "stops_has_pip_real_time_field", table: "stops", field: "has_pip_real_time", run: fields.HasPipRealTimeField},
	{id: "stops_has_schedules_field", table: "stops", field: "has_schedules", run: fields.HasSchedulesField},
	{id: "stops_has_shelter_field", table: "stops", field: "has_shelter", run: fields.HasShelterField},
	{id: "stops_has_stop_sign_field", table: "stops", field: "has_stop_sign", run: fields.HasStopSignField},
	{id: "stops_has_tariffs_information_field", table: "stops", field: "has_tariffs_information", run: fields.HasTariffsInformationField},
	{id: "stops_level_id_field", table: "stops", field: "level_id", run: fields.StopsLevelIdField},
	{id: "stops_location_type_field", table: "stops", field: "location_type", run: fields.LocationTypeField},
	{id: "stops_municipality_id_field", table: "stops", field: "municipality_id", run: fields.MunicipalityIdField},
	{id: "stops_parent_station_field", table: "stops", field: "parent_station", run: fields.ParentStationField},
	{id: "stops_parish_id_field", table: "stops", field: "parish_id", run: fields.ParishIdField},
	{id: "stops_platform_code_field", table: "stops", field: "platform_code", run: fields.PlatformCodeField},
	{id: "stops_public_visible_field", table: "stops", field: "public_visible", run: fields.PublicVisibleField},
	{id: "stops_region_id_field", table: "stops", field: "region_id", run: fields.RegionIdField},
	{id: "stops_shelter_code_field", table: "stops", field: "shelter_code", run: fields.ShelterCodeField},
	{id: "stops_shelter_maintainer_field", table: "stops", field: "shelter_maintainer", run: fields.ShelterMaintainerField},
	{id: "stops_stop_access_field", table: "stops", field: "stop_access", run: fields.StopAccessField, skipForbidden: true},
	{id: "stops_stop_code_field", table: "stops", field: "stop_code", run: fields.StopCodeField},
	{id: "stops_stop_desc_field", table: "stops", field: "stop_desc", run: fields.StopDescField},
	{id: "stops_stop_id_field", table: "stops", field: "stop_id", run: fields.StopsStopIdField},
	{id: "stops_stop_lat_field", table: "stops", field: "stop_lat", run: fields.StopLatField},
	{id: "stops_stop_lon_field", table: "stops", field: "stop_lon", run: fields.StopLonField},
	{id: "stops_stop_name_field", table: "stops", field: "stop_name", run: fields.StopNameField},
	{id: "stops_stop_short_name_field", table: "stops", field: "stop_short_name", run: fields.StopShortNameField},
	{id: "stops_stop_timezone_field", table: "stops", field: "stop_timezone", run: fields.StopTimezoneField},
	{id: "stops_stop_url_field", table: "stops", field: "stop_url", run: fields.StopUrlField},
	{id: "stops_tts_stop_name_field", table: "stops", field: "tts_stop_name", run: fields.TtsStopNameField},
	{id: "stops_wheelchair_boarding_field", table: "stops", field: "wheelchair_boarding", run: fields.WheelchairBoardingField},
	{id: "stops_zone_id_field", table: "stops", field: "zone_id", run: fields.ZoneIdField, skipForbidden: true},
	{id: "transfers_min_transfer_time_field", table: "transfers", field: "min_transfer_time", run: fields.MinTransferTimeField},
	{id: "transfers_transfer_type_field", table: "transfers", field: "transfer_type", run: fields.TransferTypeField},
	{id: "trips_bikes_allowed_field", table: "trips", field: "bikes_allowed", run: fields.BikesAllowedField},
	{id: "trips_block_id_field", table: "trips", field: "block_id", run: fields.BlockIdField},
	{id: "trips_direction_id_field", table: "trips", field: "direction_id", run: fields.DirectionIdField},
	{id: "trips_pattern_id_field", table: "trips", field: "pattern_id", run: fields.PatternIdField},
	{id: "trips_route_id_field", table: "trips", field: "route_id", run: fields.TripsRouteIdField},
	{id: "trips_service_id_field", table: "trips", field: "service_id", run: fields.TripsServiceIdField},
	{id: "trips_shape_id_field", table: "trips", field: "shape_id", run: fields.TripsShapeIdField},
	{id: "trips_trip_headsign_field", table: "trips", field: "trip_headsign", run: fields.TripHeadsignField},
	{id: "trips_trip_id_field", table: "trips", field: "trip_id", run: fields.TripsTripIdField},
	{id: "trips_trip_short_name_field", table: "trips", field: "trip_short_name", run: fields.TripShortNameField},
	{id: "trips_wheelchair_accessible_field", table: "trips", field: "wheelchair_accessible", run: fields.TripsWheelchairAccessibleField},
	{id: "vehicles_agency_id_field", table: "vehicles", field: "agency_id", run: fields.VehiclesAgencyIdField},
	{id: "vehicles_bicycles_capacity_field", table: "vehicles", field: "bicycles_capacity", run: fields.BicyclesCapacityField},
	{id: "vehicles_car_capacity_field", table: "vehicles", field: "car_capacity", run: fields.CarCapacityField},
	{id: "vehicles_emission_field", table: "vehicles", field: "emission", run: fields.EmissionField},
	{id: "vehicles_make_field", table: "vehicles", field: "make", run: fields.MakeField},
	{id: "vehicles_model_field", table: "vehicles", field: "model", run: fields.ModelField},
	{id: "vehicles_propulsion_field", table: "vehicles", field: "propulsion", run: fields.PropulsionField},
	{id: "vehicles_registration_date_field", table: "vehicles", field: "registration_date", run: fields.RegistrationDateField},
	{id: "vehicles_total_capacity_field", table: "vehicles", field: "total_capacity", run: fields.TotalCapacityField},
	{id: "vehicles_vehicle_code_field", table: "vehicles", field: "vehicle_code", run: fields.VehicleCodeField},
	{id: "vehicles_vehicle_id_field", table: "vehicles", field: "vehicle_id", run: fields.VehicleIdField},
	{id: "vehicles_vehicle_type_field", table: "vehicles", field: "vehicle_type", run: fields.VehicleTypeField},
	{id: "vehicles_wheelchair_accessible_field", table: "vehicles", field: "wheelchair_accessible", run: fields.VehiclesWheelchairAccessibleField},
}

var conditionalChecks = []fieldCheck{
	{id: "pathways_length_field", table: "pathways", field: "length", run: fields.LengthField},
	{id: "pathways_max_slope_field", table: "pathways", field: "max_slope", run: fields.MaxSlopeField},
	{id: "stop_times_end_pickup_drop_off_window_field", table: "stop_times", field: "end_pickup_drop_off_window", run: fields.EndPickupDropOffWindowField, skipForbidden: true},
	{id: "stop_times_location_group_id_field", table: "stop_times", field: "location_group_id", run: fields.LocationGroupIdField},
	{id: "stop_times_start_pickup_drop_off_window_field", table: "stop_times", field: "start_pickup_drop_off_window", run: fields.StartPickupDropOffWindowField, skipForbidden: true},
	{id: "transfers_from_route_id_field", table: "transfers", field: "from_route_id", run: fields.FromRouteIdField},
	{id: "transfers_from_stop_id_field", table: "transfers", field: "from_stop_id", run: fields.TransfersFromStopIdField},
	{id: "transfers_from_trip_id_field", table: "transfers", field: "from_trip_id", run: fields.FromTripIdField},
	{id: "transfers_to_route_id_field", table: "transfers", field: "to_route_id", run: fields.ToRouteIdField},
	{id: "transfers_to_stop_id_field", table: "transfers", field: "to_stop_id", run: fields.TransfersToStopIdField},
	{id: "transfers_to_trip_id_field", table: "transfers", field: "to_trip_id", run: fields.ToTripIdField},
}

func TestPresenceChecks(t *testing.T) {
	for _, check := range presenceChecks {
		t.Run(check.id, func(t *testing.T) {
			db := fixture(t, check.table, []string{check.field}, []int{2, 4, 7}, [][]any{{"present"}, {""}, {nil}})
			for _, severity := range []rules.Severities{rules.SEVERITY_ERROR, rules.SEVERITY_WARNING, rules.SEVERITY_INFO, rules.SEVERITY_IGNORE, rules.SEVERITY_FORBIDDEN} {
				t.Run(string(severity), func(t *testing.T) {
					rows := []int{3, 6}
					if severity == rules.SEVERITY_IGNORE || severity == rules.SEVERITY_FORBIDDEN && check.skipForbidden {
						rows = nil
					}
					key := "required"
					if severity == rules.SEVERITY_WARNING || severity == rules.SEVERITY_INFO && check.requiredMessage {
						key = "recommended"
					} else if severity != rules.SEVERITY_ERROR {
						key = "informational"
					}
					assertCheck(t, check, db, severity, rows, key)
				})
			}

			t.Run("missing_column", func(t *testing.T) {
				db := fixture(t, check.table, []string{"unrelated"}, []int{3}, [][]any{{"value"}})
				assertCheck(t, check, db, rules.SEVERITY_ERROR, []int{2}, "required")
			})
			t.Run("missing_table", func(t *testing.T) {
				collector := &testutil.Collector{}
				ctx := context.NewRuleContext(check.id, emptyDatabase(t), rules.RuleContext{Severity: rules.SEVERITY_ERROR}, collector)
				if err := check.run(ctx); err != nil || !ctx.Skipped || ctx.Failed || len(collector.Messages) != 0 {
					t.Fatalf("missing source table should skip without findings: ctx=%+v err=%v", ctx, err)
				}
			})
			t.Run("query_error", func(t *testing.T) {
				db := emptyDatabase(t)
				if err := db.Close(); err != nil {
					t.Fatal(err)
				}
				collector := &testutil.Collector{}
				ctx := context.NewRuleContext(check.id, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR}, collector)
				if err := check.run(ctx); err == nil || len(collector.Messages) != 0 {
					t.Fatalf("query error must be returned without a data finding: %v", err)
				}
			})
		})
	}
}

func TestConditionalChecks(t *testing.T) {
	for _, check := range conditionalChecks {
		t.Run(check.id, func(t *testing.T) {
			var columns []string
			type conditionalCase struct {
				name   string
				values []any
				key    string
			}
			var cases []conditionalCase
			primary := check.field
			switch check.field {
			case "length", "max_slope":
				columns = []string{primary, "pathway_mode"}
				for _, mode := range []string{"1", "2", "3", "6", "7", "invalid", ""} {
					key := "required"
					if primary == "length" && (mode == "1" || mode == "6" || mode == "7") || primary == "max_slope" && (mode == "1" || mode == "3") {
						key = "recommended"
					}
					cases = append(cases, conditionalCase{"mode_" + mode, []any{"", mode}, key})
				}
				cases = append(cases, conditionalCase{"present", []any{"1", "1"}, ""})
			case "start_pickup_drop_off_window", "end_pickup_drop_off_window":
				columns = []string{primary, "arrival_time", "departure_time"}
				cases = append(cases,
					conditionalCase{"empty", []any{"", "", ""}, "required"},
					conditionalCase{"null", []any{nil, nil, nil}, "required"},
					conditionalCase{"window", []any{"12:00:00", "", ""}, ""},
					conditionalCase{"arrival", []any{"", "12:00:00", ""}, ""},
					conditionalCase{"departure", []any{"", "", "12:00:00"}, ""})
			case "from_route_id", "to_route_id":
				trip := strings.TrimSuffix(primary, "route_id") + "trip_id"
				columns = []string{primary, trip}
				cases = append(cases,
					conditionalCase{"missing_both", []any{"", ""}, "recommended"},
					conditionalCase{"trip", []any{"", "T1"}, ""},
					conditionalCase{"route", []any{"R1", ""}, ""})
			case "from_stop_id", "to_stop_id", "from_trip_id", "to_trip_id":
				columns = []string{primary, "transfer_type"}
				for _, kind := range []string{"0", "1", "2", "3", "4", "5", "invalid", ""} {
					key := ""
					if strings.HasSuffix(primary, "stop_id") {
						if kind == "1" || kind == "2" || kind == "3" {
							key = "required"
						}
					} else if kind == "4" || kind == "5" {
						key = "required"
					} else {
						key = "recommended"
					}
					cases = append(cases, conditionalCase{"type_" + kind, []any{"", kind}, key})
				}
				cases = append(cases, conditionalCase{"present", []any{"ID", "4"}, ""})
			case "location_group_id":
				columns = []string{primary, "stop_id", "location_id"}
				cases = append(cases,
					conditionalCase{"stop_match", []any{"G1", "G1", "L1"}, "forbidden_stop_location"},
					conditionalCase{"location_match", []any{"G1", "S1", "G1"}, "forbidden_stop_location"},
					conditionalCase{"no_match", []any{"G1", "S1", "L1"}, ""})
			default:
				t.Fatalf("missing conditional fixture for %s", primary)
			}
			for _, tc := range cases {
				t.Run(tc.name, func(t *testing.T) {
					db := fixture(t, check.table, columns, []int{5}, [][]any{tc.values})
					for _, severity := range []rules.Severities{rules.SEVERITY_ERROR, rules.SEVERITY_WARNING, rules.SEVERITY_INFO, rules.SEVERITY_IGNORE, rules.SEVERITY_FORBIDDEN} {
						t.Run(string(severity), func(t *testing.T) {
							var rows []int
							if tc.key != "" && severity != rules.SEVERITY_IGNORE && !(severity == rules.SEVERITY_FORBIDDEN && check.skipForbidden) {
								rows = []int{4}
							}
							key := tc.key
							severityWording := primary == "length" || primary == "max_slope" || strings.HasSuffix(primary, "window") || strings.HasSuffix(primary, "stop_id")
							if key == "required" && severityWording {
								if severity == rules.SEVERITY_WARNING {
									key = "recommended"
								} else if severity != rules.SEVERITY_ERROR {
									key = "informational"
								}
							}
							assertCheck(t, check, db, severity, rows, key)
						})
					}
				})
			}
		})
	}
}

func TestLocationGroupChecksOtherRowsWithoutHoldingSQLiteCursor(t *testing.T) {
	check := fieldCheck{id: "stop_times_location_group_id_field", table: "stop_times", field: "location_group_id", run: fields.LocationGroupIdField}
	db := fixture(t, check.table, []string{"location_group_id", "stop_id", "location_id"}, []int{2, 8}, [][]any{{"G1", "S1", "L1"}, {"G2", "G1", "L2"}})
	assertCheck(t, check, db, rules.SEVERITY_ERROR, []int{1}, "forbidden_stop_location")
}

func TestChecksUseTheSuppliedRuleIdentity(t *testing.T) {
	for _, check := range []fieldCheck{
		{id: "caller_agency", table: "agency", field: "agency_id", run: fields.AgencyAgencyIdField},
		{id: "caller_transfer", table: "transfers", field: "transfer_type", run: fields.TransferTypeField},
	} {
		db := fixture(t, check.table, []string{check.field}, []int{3}, [][]any{{""}})
		assertCheck(t, check, db, rules.SEVERITY_INFO, []int{2}, "informational")
	}
}

func assertCheck(t *testing.T, check fieldCheck, db *sql.DB, severity rules.Severities, rows []int, key string) {
	t.Helper()
	collector := &testutil.Collector{}
	ctx := context.NewRuleContext(check.id, db, rules.RuleContext{Severity: severity}, collector)
	if err := check.run(ctx); err != nil {
		t.Fatal(err)
	}
	if ctx.Failed != (len(rows) > 0) || ctx.Source != nil || ctx.Row != -1 || ctx.Skipped {
		t.Fatalf("unexpected rule outcome or leaked row context: %+v", ctx)
	}
	if len(collector.Messages) != len(rows) {
		t.Fatalf("got %d findings, want %d: %+v", len(collector.Messages), len(rows), collector.Messages)
	}
	if severity == rules.SEVERITY_FORBIDDEN {
		severity = rules.SEVERITY_ERROR
	}
	for index, message := range collector.Messages {
		if message.RuleID != check.id || message.Field != check.field || message.FileName != check.table+".txt" || message.Severity != severity || !reflect.DeepEqual(message.Rows, []int{rows[index]}) || !message.SeverityResolved || message.Message != i18n.AppTranslator.Get(check.id+"."+key) {
			t.Errorf("unexpected finding: %+v", message)
		}
	}
}

func emptyDatabase(t *testing.T) *sql.DB {
	t.Helper()
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "gtfs.sqlite"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	db.SetMaxOpenConns(1)
	return db
}

func fixture(t *testing.T, table string, columns []string, rowIDs []int, rows [][]any) *sql.DB {
	t.Helper()
	db := emptyDatabase(t)
	definitions := make([]string, len(columns))
	placeholders := make([]string, len(columns))
	for index, column := range columns {
		definitions[index] = `"` + column + `" TEXT`
		placeholders[index] = "?"
	}
	if _, err := db.Exec(`CREATE TABLE "` + table + `" (` + strings.Join(definitions, ",") + `)`); err != nil {
		t.Fatal(err)
	}
	query := `INSERT INTO "` + table + `" (rowid, "` + strings.Join(columns, `","`) + `") VALUES (?,` + strings.Join(placeholders, ",") + `)`
	for index, row := range rows {
		values := append([]any{rowIDs[index]}, row...)
		if _, err := db.Exec(query, values...); err != nil {
			t.Fatal(err)
		}
	}
	return db
}
