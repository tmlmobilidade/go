package standard_test

import (
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
)

func namedCheck(t *testing.T, id string) standardCheck {
	t.Helper()
	for _, check := range migratedChecks {
		if check.id == id {
			return check
		}
	}
	t.Fatalf("missing migrated check %s", id)
	return standardCheck{}
}

func TestStandardValueFormats(t *testing.T) {
	for _, tc := range []struct{ id, valid, invalid string }{
		{"agency_email_valid", "service@example.com", "invalid-email"},
		{"agency_fare_url_valid", "https://example.com/fares", "not a URL"},
		{"agency_lang_valid", "pt", "not-a-language"},
		{"agency_phone_valid", "+351 212 345 678", "@@@"},
		{"agency_timezone_valid", "Europe/Lisbon", "Europe/Nowhere"},
		{"agency_url_valid", "https://example.com", "not a URL"},
		{"calendar_dates_date_valid", "20240229", "20230229"},
		{"fare_attributes_currency_type_valid", "EUR", "INVALID"},
		{"feed_info_default_lang_valid", "pt", "not-a-language"},
		{"feed_info_feed_contact_email_valid", "service@example.com", "invalid-email"},
		{"feed_info_feed_contact_url_valid", "https://example.com", "not a URL"},
		{"feed_info_feed_end_date_format", "20240229", "20230229"},
		{"feed_info_feed_lang_valid", "pt", "not-a-language"},
		{"feed_info_feed_publisher_url_valid", "https://example.com", "not a URL"},
		{"feed_info_feed_start_date_format", "20240229", "20230229"},
		{"frequencies_start_time_valid", "25:00:00", "tomorrow"},
		{"frequencies_end_time_valid", "26:00:00", "tomorrow"},
		{"rider_categories_eligibility_url_valid", "https://example.com", "not a URL"},
		{"routes_route_color_valid", "00AAbb", "GGGGGG"},
		{"routes_route_text_color_valid", "FFFFFF", "GGGGGG"},
		{"routes_route_url_valid", "https://example.com", "not a URL"},
		{"stop_times_arrival_time_valid", "25:00:00", "tomorrow"},
		{"stop_times_departure_time_valid", "26:00:00", "tomorrow"},
		{"stops_stop_timezone_valid", "Europe/Lisbon", "Europe/Nowhere"},
		{"stops_stop_url_valid", "https://example.com", "not a URL"},
		{"vehicles_registration_date_valid", "20240229", "20230229"},
	} {
		t.Run(tc.id, func(t *testing.T) {
			check := namedCheck(t, tc.id)
			db := fixture(t, check.table, []string{check.field}, []int{2, 5, 8, 11}, [][]any{{tc.valid}, {tc.invalid}, {""}, {nil}})
			options := []string{"this option must not turn a format rule into an allowlist"}
			ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR, Options: &options})
			assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR, 4)
			// A column absent from an imported table follows empty-cell semantics.
			ctx, findings = runCheck(t, check, fixture(t, check.table, []string{"unrelated"}, []int{7}, [][]any{{"value"}}), rules.RuleContext{Severity: rules.SEVERITY_ERROR})
			assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR)
		})
	}
}

func TestStandardNumericValues(t *testing.T) {
	for _, tc := range []struct {
		id             string
		valid, invalid []string
	}{
		{"fare_attributes_price_valid", []string{"0", "1.25"}, []string{"-1", "word", "NaN", "+Inf", "1e999"}},
		{"fare_attributes_transfer_duration_valid", []string{"0", "120"}, []string{"-1", "word", "1.5", "999999999999999999999999"}},
		{"frequencies_headway_secs_valid", []string{"1", "120"}, []string{"0", "-1", "word", "1.5", "999999999999999999999999"}},
		{"levels_level_index_valid", []string{"0", "1.5"}, []string{"-1", "word", "NaN", "+Inf", "1e100"}},
		{"pathways_length_valid", []string{"0", "1.5"}, []string{"-1", "word", "NaN", "+Inf", "1e100"}},
		{"pathways_min_width_valid", []string{"1", "1.5"}, []string{"0", "-1", "word", "NaN", "+Inf", "1e999"}},
		{"pathways_stair_count_valid", []string{"0", "65535"}, []string{"-1", "65536", "word", "1.5"}},
		{"pathways_traversal_time_valid", []string{"0", "120"}, []string{"-1", "word", "1.5", "999999999999999999999999"}},
		{"routes_route_sort_order_valid", []string{"0", "120"}, []string{"-1", "word", "1.5", "999999999999999999999999"}},
		{"shapes_shape_dist_traveled_valid", []string{"0", "1.5"}, []string{"-1", "word", "NaN", "+Inf", "1e999"}},
		{"shapes_shape_pt_sequence_non_negative", []string{"0", "120"}, []string{"-1", "word", "1.5", "999999999999999999999999"}},
		{"shapes_shape_pt_lat_valid", []string{"-90", "90", "0"}, []string{"-91", "91", "word", "NaN", "+Inf"}},
		{"shapes_shape_pt_lon_valid", []string{"-180", "180", "0"}, []string{"-181", "181", "word", "NaN", "+Inf"}},
		{"stop_times_shape_dist_traveled_valid", []string{"0", "1.5"}, []string{"-1", "word", "NaN", "+Inf", "1e999"}},
		{"stops_stop_lat_valid", []string{"-90", "90", "0"}, []string{"-91", "91", "word", "NaN", "+Inf"}},
		{"stops_stop_lon_valid", []string{"-180", "180", "0"}, []string{"-181", "181", "word", "NaN", "+Inf"}},
		{"transfers_min_transfer_time_valid", []string{"0", "120"}, []string{"-1", "word", "1.5", "999999999999999999999999"}},
		{"vehicles_bicycles_capacity_valid", []string{"0", "120"}, []string{"-1", "word", "1.5", "999999999999999999999999"}},
		{"vehicles_car_capacity_valid", []string{"0", "120"}, []string{"-1", "word", "1.5", "999999999999999999999999"}},
		{"vehicles_total_capacity_valid", []string{"0", "120"}, []string{"-1", "word", "1.5", "999999999999999999999999"}},
	} {
		t.Run(tc.id, func(t *testing.T) {
			check := namedCheck(t, tc.id)
			values := append(append([]string{}, tc.valid...), tc.invalid...)
			var rowIDs, expected []int
			var rows [][]any
			for i, value := range values {
				rowIDs = append(rowIDs, 2+i*3)
				rows = append(rows, []any{value})
				if i >= len(tc.valid) {
					expected = append(expected, 1+i*3)
				}
			}
			rowIDs = append(rowIDs, 2+len(rows)*3, 5+len(rows)*3)
			rows = append(rows, []any{""}, []any{nil})
			ctx, findings := runCheck(t, check, fixture(t, check.table, []string{check.field}, rowIDs, rows), rules.RuleContext{Severity: rules.SEVERITY_ERROR})
			assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR, expected...)
		})
	}
}

func TestStandardEnums(t *testing.T) {
	for _, tc := range []struct{ id, valid, invalid string }{
		{"calendar_dates_exception_type_valid", "1", "3"},
		{"calendar_monday_valid", "1", "2"},
		{"calendar_tuesday_valid", "0", "2"},
		{"calendar_wednesday_valid", "1", "2"},
		{"calendar_thursday_valid", "0", "2"},
		{"calendar_friday_valid", "1", "2"},
		{"calendar_saturday_valid", "0", "2"},
		{"calendar_sunday_valid", "1", "2"},
		{"fare_attributes_payment_method_valid", "0", "2"},
		{"fare_attributes_transfers_valid", "2", "3"},
		{"frequencies_exact_times_valid", "1", "2"},
		{"pathways_pathway_mode_valid", "5", "8"},
		{"rider_categories_is_default_fare_category_valid", "1", "2"},
		{"routes_route_type_valid", "3", "999"},
		{"stop_times_drop_off_type_valid", "3", "4"},
		{"stop_times_pickup_type_valid", "3", "4"},
		{"stop_times_timepoint_valid", "1", "2"},
		{"stops_location_type_valid", "4", "5"},
		{"stops_wheelchair_boarding_valid", "2", "3"},
		{"transfers_transfer_type_valid", "5", "6"},
		{"trips_bikes_allowed_valid", "2", "3"},
		{"trips_direction_id_valid", "1", "2"},
		{"trips_wheelchair_accessible_valid", "2", "3"},
	} {
		t.Run(tc.id, func(t *testing.T) {
			check := namedCheck(t, tc.id)
			db := fixture(t, check.table, []string{check.field}, []int{2, 5, 8, 11, 14}, [][]any{{tc.valid}, {tc.invalid}, {"word"}, {""}, {nil}})
			ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
			assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR, 4, 7)
		})
	}
}

func TestStandardSeverityAndConfiguredIdentity(t *testing.T) {
	check := namedCheck(t, "agency_email_valid")
	check.id = "configured_email_rule"
	db := fixture(t, "agency", []string{"agency_email"}, []int{5}, [][]any{{"invalid-email"}})
	for _, severity := range []rules.Severities{rules.SEVERITY_ERROR, rules.SEVERITY_WARNING, rules.SEVERITY_INFO, rules.SEVERITY_IGNORE, rules.SEVERITY_FORBIDDEN, ""} {
		t.Run(string(severity), func(t *testing.T) {
			var rows []int
			if severity != "" && severity != rules.SEVERITY_IGNORE {
				rows = []int{4}
			}
			ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: severity})
			assertRows(t, check, ctx, findings, severity, rows...)
		})
	}
}

func TestStandardAllowedOptions(t *testing.T) {
	for _, id := range []string{"agency_id_valid", "agency_name_valid", "stops_location_type_allowed", "stops_platform_code_allowed", "stops_municipality_id_allowed", "stops_parish_id_allowed", "stops_region_id_allowed"} {
		t.Run(id, func(t *testing.T) {
			check := namedCheck(t, id)
			db := fixture(t, check.table, []string{check.field}, []int{2, 5, 8, 11}, [][]any{{"allowed"}, {"other"}, {""}, {nil}})
			for _, tc := range []struct {
				name    string
				options *[]string
				rows    []int
			}{
				{"unrestricted", nil, nil},
				{"allowlist", &[]string{"allowed"}, []int{4}},
				{"empty_allowlist", &[]string{}, []int{1, 4}},
				{"wildcard", &[]string{variables.AllRuleOptions}, nil},
			} {
				t.Run(tc.name, func(t *testing.T) {
					ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_WARNING, Options: tc.options})
					assertRows(t, check, ctx, findings, rules.SEVERITY_WARNING, tc.rows...)
				})
			}
		})
	}
}
