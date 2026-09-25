package file_validation

import (
	ruleset "main/lib/rules"
	"main/services"
	"main/types"
	"testing"
)

func TestAgencyMissingFileSeverities(t *testing.T) {
	for _, file := range []string{"trips", "shapes"} {
		for _, severity := range []types.Severity{types.SEVERITY_IGNORE, types.SEVERITY_WARNING, types.SEVERITY_ERROR, types.SEVERITY_FORBIDDEN} {
			t.Run(file+"/"+string(severity), func(t *testing.T) {
				services.AppMessageService.Clear()
				config := ruleset.DefaultConfig()
				if file == "trips" {
					config.Trips.File = severity
				} else {
					config.Shapes.File = severity
				}
				gtfs, cleanup, err := createTestGtfs(types.Gtfs{})
				if err != nil {
					t.Fatal(err)
				}
				defer cleanup()
				defer gtfs.Close()
				hasErrors := NewFileValidation().Validate(*gtfs, &config)
				summary := services.AppMessageService.GetSummary()
				want := 0
				if severity == types.SEVERITY_ERROR || severity == types.SEVERITY_WARNING {
					want = 1
				}
				if len(summary.Messages) != want || hasErrors != (severity == types.SEVERITY_ERROR) {
					t.Fatalf("unexpected result: %+v", summary)
				}
				if want == 1 && (summary.Messages[0].RuleID != file+"_file_missing" || summary.Messages[0].Severity != severity) {
					t.Fatalf("wrong message: %+v", summary.Messages[0])
				}
			})
		}
	}
}

func TestAgencyConditionalPresenceSeverities(t *testing.T) {
	cases := []struct {
		name      string
		gtfs      types.Gtfs
		configure func(*types.GtfsRules, types.Severity)
		check     func(*FileValidation, types.Gtfs, *types.GtfsRules)
		id        string
	}{
		{"stops", types.Gtfs{}, func(c *types.GtfsRules, s types.Severity) { c.Stops.File = s }, (*FileValidation).checkStopsConditional, "stops_file_missing"},
		{"calendar", types.Gtfs{}, func(c *types.GtfsRules, s types.Severity) { c.Calendar.File = s }, (*FileValidation).checkCalendarFiles, "calendar_file_missing"},
		{"levels", types.Gtfs{Pathways: []types.PathwaysRaw{{PathwayId: "1", PathwayMode: "5"}}}, func(c *types.GtfsRules, s types.Severity) { c.Levels.File = s }, (*FileValidation).checkLevelsIfElevator, "levels_file_missing"},
		{"feed_info", types.Gtfs{Translations: []types.TranslationsRaw{{TableName: "stops"}}}, func(c *types.GtfsRules, s types.Severity) { c.FeedInfo.File = s }, (*FileValidation).checkFeedInfoWithTranslations, "feed_info_file_missing"},
	}
	for _, tc := range cases {
		for _, severity := range []types.Severity{types.SEVERITY_IGNORE, types.SEVERITY_WARNING, types.SEVERITY_ERROR, types.SEVERITY_FORBIDDEN} {
			t.Run(tc.name+"/"+string(severity), func(t *testing.T) {
				services.AppMessageService.Clear()
				config := ruleset.DefaultConfig()
				tc.configure(&config, severity)
				gtfs, cleanup, err := createTestGtfs(tc.gtfs)
				if err != nil {
					t.Fatal(err)
				}
				defer cleanup()
				defer gtfs.Close()
				validator := NewFileValidation()
				tc.check(validator, *gtfs, &config)
				summary := services.AppMessageService.GetSummary()
				want := 0
				if severity == types.SEVERITY_WARNING || severity == types.SEVERITY_ERROR {
					want = 1
				}
				if len(summary.Messages) != want {
					t.Fatalf("unexpected result: %+v", summary)
				}
				if want == 1 && (summary.Messages[0].RuleID != tc.id || summary.Messages[0].Severity != severity) {
					t.Fatalf("wrong message: %+v", summary.Messages[0])
				}
				// A full run must not duplicate the conditional notice with a generic one.
				services.AppMessageService.Clear()
				validator.Validate(*gtfs, &config)
				if got := len(services.AppMessageService.GetSummary().Messages); got != want {
					t.Fatalf("full run emitted %d messages, want %d", got, want)
				}
			})
		}
	}
}

func TestForbiddenAgencyFilePresent(t *testing.T) {
	services.AppMessageService.Clear()
	config := ruleset.DefaultConfig()
	config.Trips.File = types.SEVERITY_FORBIDDEN
	gtfs, cleanup, err := createTestGtfs(types.Gtfs{Trip: []types.TripRaw{{TripId: "1"}}})
	if err != nil {
		t.Fatal(err)
	}
	defer cleanup()
	defer gtfs.Close()
	if !NewFileValidation().Validate(*gtfs, &config) || services.AppMessageService.TotalErrors() != 1 {
		t.Fatal("forbidden file not rejected")
	}
}
