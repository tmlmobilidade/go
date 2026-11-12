package standardutils_test

import (
	"testing"

	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/validations"
	standardutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/utils"
)

func TestStopTimePreferenceAndBarriers(t *testing.T) {
	for _, tc := range []struct {
		name, arrival, departure string
		departureFirst           bool
		seconds                  int
		value                    string
		ok                       bool
	}{
		{"arrival_first", "10:00:00", "11:00:00", false, 36000, "10:00:00", true},
		{"departure_first", "10:00:00", "11:00:00", true, 39600, "11:00:00", true},
		{"fallback_to_departure", "bad", "11:00:00", false, 39600, "11:00:00", true},
		{"fallback_to_arrival", "10:00:00", "bad", true, 36000, "10:00:00", true},
		{"after_midnight", "25:01:02", "", false, 90062, "25:01:02", true},
		{"missing", "", "", false, 0, "", false},
		{"invalid_minutes", "12:60:00", "", false, 0, "", false},
		{"invalid_seconds", "12:00:60", "", false, 0, "", false},
		{"negative_hours", "-1:00:00", "", false, 0, "", false},
		{"malformed", "tomorrow", "99:99:99", false, 0, "", false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			seconds, value, ok := standardutils.StopTime(validationTypes.TimeSequenceStop{ArrivalTime: tc.arrival, DepartureTime: tc.departure}, tc.departureFirst)
			if seconds != tc.seconds || value != tc.value || ok != tc.ok {
				t.Errorf("got (%d,%q,%v), want (%d,%q,%v)", seconds, value, ok, tc.seconds, tc.value, tc.ok)
			}
		})
	}
}
