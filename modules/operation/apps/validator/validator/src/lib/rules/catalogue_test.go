package rules

import (
	"main/types"
	"testing"
)

func TestDecodeConfigPreservesSavedSettingsAndDefaultsMissing(t *testing.T) {
	config, err := DecodeConfig([]byte(`{"trips":{"_file":"warning","trip_id_unique":{"severity":"error","options":["T1"],"depends_on":["pattern_id_present_and_references_consistent"]}}}`))
	if err != nil {
		t.Fatal(err)
	}
	if config.Trips.File != types.SEVERITY_WARNING || config.Trips.TripId.Severity != types.SEVERITY_ERROR {
		t.Fatal("saved severities changed")
	}
	if config.Shapes.File != types.SEVERITY_IGNORE || config.Trips.RouteId.Severity != types.SEVERITY_IGNORE {
		t.Fatal("missing values were not ignored")
	}
	if config.Trips.TripId.Options == nil || (*config.Trips.TripId.Options)[0] != "T1" || len(config.Trips.TripId.DependsOn) != 1 {
		t.Fatal("metadata lost")
	}
}

func TestDecodeConfigRejectsInvalidExplicitValues(t *testing.T) {
	for _, input := range []string{`null`, `[]`, `{"trips":null}`, `{"trips":{"_file":null}}`, `{"trips":{"_file":"info"}}`, `{"trips":{"trip_id_unique":null}}`, `{"trips":{"trip_id_unique":{"severity":""}}}`, `{"trips":{"trip_id_unique":{"severity":null}}}`} {
		t.Run(input, func(t *testing.T) {
			if _, err := DecodeConfig([]byte(input)); err == nil {
				t.Fatal("invalid explicit value accepted")
			}
		})
	}
}

func TestMessageSeverityUsesAgencyAndLeavesTechnicalErrorsFixed(t *testing.T) {
	defer ConfigureMessageSeverities(nil)
	config := DefaultConfig()
	config.Shapes.ShapeId.Severity = types.SEVERITY_WARNING
	config.Frequencies.TripId.Severity = types.SEVERITY_ERROR
	config.Calendar.StartDate.Severity = types.SEVERITY_WARNING
	ConfigureMessageSeverities(&config)
	for _, tc := range []struct {
		file, id, field string
		want            types.Severity
	}{
		{"shapes.txt", "shape_id_required", "shape_id", types.SEVERITY_WARNING},
		{"trips.txt", "trip_id_unique", "trip_id", types.SEVERITY_IGNORE},
		{"frequencies.txt", "frequencies_trip_id_references_trips_table", "trip_id", types.SEVERITY_ERROR},
		{"calendar.txt", "calendar_start_end_dates_valid_yyyymmdd_order", "start_date", types.SEVERITY_WARNING},
		{"calendar.txt", "calendar_start_end_dates_valid_yyyymmdd_order", "end_date", types.SEVERITY_IGNORE},
		{"trips.txt", "trips_values_parse", "trip_id", types.SEVERITY_ERROR},
	} {
		if got := ResolveMessageSeverity(tc.file, tc.id, tc.field, types.SEVERITY_ERROR); got != tc.want {
			t.Errorf("%s: got %s want %s", tc.id, got, tc.want)
		}
	}
	config.Shapes.ShapeId.Severity = types.SEVERITY_IGNORE
	ConfigureMessageSeverities(&config)
	if got := ResolveMessageSeverity("shapes.txt", "shape_id_required", "shape_id", types.SEVERITY_ERROR); got != types.SEVERITY_IGNORE {
		t.Fatal("previous agency settings leaked")
	}
	ConfigureMessageSeverities(nil)
	if got := ResolveMessageSeverity("shapes.txt", "shape_id_required", "shape_id", types.SEVERITY_ERROR); got != types.SEVERITY_ERROR {
		t.Fatal("standalone changed")
	}
}
