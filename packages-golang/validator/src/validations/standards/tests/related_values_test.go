package standard_test

import (
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
)

func TestDateRangeComparisons(t *testing.T) {
	for _, tc := range []struct{ id, start, end string }{
		{"calendar_start_end_dates_valid", "start_date", "end_date"},
		{"feed_info_start_end_dates_valid", "feed_start_date", "feed_end_date"},
	} {
		t.Run(tc.id, func(t *testing.T) {
			check := namedCheck(t, tc.id)
			db := fixture(t, check.table, []string{tc.start, tc.end}, []int{2, 5, 8, 11, 14}, [][]any{
				{"20240101", "20240201"}, {"20240201", "20240101"}, {"20240101", "20240101"}, {"", "20240101"}, {"20240101", nil},
			})
			ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
			// Preserve the supplied policy: equal start/end dates are also invalid.
			assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR, 4, 7)
		})
	}
}

func TestCalendarValidatesBothDateFormats(t *testing.T) {
	check := namedCheck(t, "calendar_start_end_dates_valid_format")
	db := fixture(t, "calendar", []string{"start_date", "end_date"}, []int{2, 5, 8, 11, 14}, [][]any{
		{"20240101", "20240229"}, {"20230229", "20240101"}, {"20240101", "bad"}, {"", ""}, {nil, nil},
	})
	ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
	assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR, 4, 7)
}

func TestPickupDropOffWindows(t *testing.T) {
	for _, id := range []string{"stop_times_start_pickup_drop_off_window_valid", "stop_times_end_pickup_drop_off_window_valid"} {
		t.Run(id, func(t *testing.T) {
			check := namedCheck(t, id)
			db := fixture(t, "stop_times", []string{check.field, "arrival_time", "departure_time", "location_id"}, []int{2, 5, 8, 11, 14}, [][]any{
				{"25:00:00", "", "", ""}, {"invalid", "", "", ""}, {"10:00:00", "10:00:00", "", ""}, {"10:00:00", "", "11:00:00", ""}, {"", "", "", "area"},
			})
			ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
			assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR, 4, 7, 10)
		})
	}
}

func TestParentStationRequiredForSpecificLocationTypes(t *testing.T) {
	check := namedCheck(t, "stops_parent_station_empty_location_types")
	db := fixture(t, "stops", []string{"parent_station", "location_type"}, []int{2, 5, 8, 11, 14, 17}, [][]any{
		{"", "0"}, {"", "1"}, {"", "2"}, {nil, "3"}, {"", "4"}, {"parent", "2"},
	})
	ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
	assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR, 7, 10, 13)
}

func TestStopDescriptionDiffersFromName(t *testing.T) {
	check := namedCheck(t, "stops_stop_desc_different_stop_name")
	db := fixture(t, "stops", []string{"stop_desc", "stop_name"}, []int{2, 5, 8, 11}, [][]any{
		{"description", "name"}, {"same", "same"}, {"", ""}, {nil, nil},
	})
	ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
	assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR, 4)
}
