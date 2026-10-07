package rules_test

import (
	"encoding/json"
	"main/lib/rules/rules"
	"main/types"
	"strings"
	"testing"
)

func TestRuleIDsIdentifyTheirDomainWithoutRedundantPrefixes(t *testing.T) {
	aliases := map[string]string{
		"vehicles": "vehicle", "trips": "trip", "stops": "stop",
		"shapes": "shape", "routes": "route", "frequencies": "frequency",
		"transfers": "transfer", "pathways": "pathway", "levels": "level",
		"rider_categories": "rider_category", "fare_rules": "fare_rule",
		"fare_attributes": "fare", "feed_info": "feed", "file_validation": "file",
	}
	for _, entry := range rules.Catalogue() {
		alias := aliases[entry.Group]
		identified := entry.ID == entry.Group || strings.HasPrefix(entry.ID, entry.Group+"_")
		if alias != "" {
			identified = identified || strings.HasPrefix(entry.ID, alias+"_")
			// vehicle_type is the actual field name, not a repeated domain prefix.
			if strings.HasPrefix(entry.ID, entry.Group+"_"+alias+"_") && entry.ID != "vehicles_vehicle_type_valid_enum" {
				t.Errorf("%s has a redundant domain prefix", entry.ID)
			}
		}
		if !identified {
			t.Errorf("%s rule ID lacks its group prefix: %s", entry.Group, entry.ID)
		}
		if entry.Editable && entry.ConfigKey != "_file" && entry.ConfigKey != entry.ID {
			t.Errorf("%s configuration key differs from its rule ID: %s", entry.ID, entry.ConfigKey)
		}
	}
}

func TestDecodeConfigPreservesCompleteSettings(t *testing.T) {
	saved := rules.DefaultConfig()
	saved.Trips.File = types.SEVERITY_WARNING
	options := []string{"T1"}
	saved.Trips.TripId = types.RuleConfig{Severity: types.SEVERITY_ERROR, Options: &options, DependsOn: []string{"trips_pattern_id_present_and_references_consistent"}}
	data, err := json.Marshal(saved)
	if err != nil {
		t.Fatal(err)
	}
	config, err := rules.DecodeConfig(data)
	if err != nil {
		t.Fatal(err)
	}
	if config.Trips.File != types.SEVERITY_WARNING || config.Trips.TripId.Severity != types.SEVERITY_ERROR {
		t.Fatal("saved severities changed")
	}
	if config.Shapes.File != types.SEVERITY_IGNORE || config.Trips.RouteId.Severity != types.SEVERITY_IGNORE {
		t.Fatal("explicit ignore settings changed")
	}
	if config.Trips.TripId.Options == nil || (*config.Trips.TripId.Options)[0] != "T1" || len(config.Trips.TripId.DependsOn) != 1 {
		t.Fatal("metadata lost")
	}
}

func TestDecodeConfigRejectsInvalidExplicitValues(t *testing.T) {
	for _, input := range []string{`null`, `[]`, `{"trips":null}`, `{"trips":{"_file":null}}`, `{"trips":{"_file":"info"}}`, `{"trips":{"trip_id_unique":null}}`, `{"trips":{"trip_id_unique":{"severity":""}}}`, `{"trips":{"trip_id_unique":{"severity":null}}}`} {
		t.Run(input, func(t *testing.T) {
			if _, err := rules.DecodeConfig([]byte(input)); err == nil {
				t.Fatal("invalid explicit value accepted")
			}
		})
	}
}

func TestDecodeConfigRequiresEverySupportedRule(t *testing.T) {
	for _, tc := range []struct {
		name, want string
		change     func(map[string]map[string]any)
	}{
		{"renamed rule", "missing rules: agency.agency_id_unique", func(input map[string]map[string]any) {
			input["agency"]["agency_id"] = input["agency"]["agency_id_unique"]
			delete(input["agency"], "agency_id_unique")
		}},
		{"missing section", "agency.agency_id_unique", func(input map[string]map[string]any) {
			delete(input, "agency")
		}},
		{"missing file rule", "missing rules: agency._file", func(input map[string]map[string]any) {
			delete(input["agency"], "_file")
		}},
		{"missing severity", "agency.agency_id_unique.severity: required", func(input map[string]map[string]any) {
			input["agency"]["agency_id_unique"] = map[string]any{}
		}},
		{"forbidden file", "missing rules: agency.agency_id_unique", func(input map[string]map[string]any) {
			input["agency"]["_file"] = "forbidden"
			delete(input["agency"], "agency_id_unique")
		}},
		{"unsupported sections", "", func(input map[string]map[string]any) {
			input["translations"] = map[string]any{"_file": "ignore"}
			input["attributions"] = map[string]any{"_file": "ignore"}
		}},
		{"meta file setting", "", func(input map[string]map[string]any) {
			delete(input["file_validation"], "_file")
		}},
	} {
		t.Run(tc.name, func(t *testing.T) {
			data, err := json.Marshal(rules.DefaultConfig())
			if err != nil {
				t.Fatal(err)
			}
			var input map[string]map[string]any
			if err := json.Unmarshal(data, &input); err != nil {
				t.Fatal(err)
			}
			tc.change(input)
			data, err = json.Marshal(input)
			if err != nil {
				t.Fatal(err)
			}
			_, err = rules.DecodeConfig(data)
			if tc.want == "" {
				if err != nil {
					t.Fatal(err)
				}
			} else if err == nil || !strings.Contains(err.Error(), tc.want) {
				t.Fatalf("got %v, want error containing %s", err, tc.want)
			}
		})
	}
}

func TestMessageSeverityUsesAgencyAndLeavesTechnicalErrorsFixed(t *testing.T) {
	defer rules.ConfigureMessageSeverities(nil)
	config := rules.DefaultConfig()
	config.Shapes.ShapeId.Severity = types.SEVERITY_WARNING
	config.Frequencies.TripId.Severity = types.SEVERITY_ERROR
	config.Calendar.StartDate.Severity = types.SEVERITY_WARNING
	rules.ConfigureMessageSeverities(&config)
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
		if got := rules.ResolveMessageSeverity(tc.file, tc.id, tc.field, types.SEVERITY_ERROR); got != tc.want {
			t.Errorf("%s: got %s want %s", tc.id, got, tc.want)
		}
	}
	config.Shapes.ShapeId.Severity = types.SEVERITY_IGNORE
	rules.ConfigureMessageSeverities(&config)
	if got := rules.ResolveMessageSeverity("shapes.txt", "shape_id_required", "shape_id", types.SEVERITY_ERROR); got != types.SEVERITY_IGNORE {
		t.Fatal("previous agency settings leaked")
	}
	rules.ConfigureMessageSeverities(nil)
	if got := rules.ResolveMessageSeverity("shapes.txt", "shape_id_required", "shape_id", types.SEVERITY_ERROR); got != types.SEVERITY_ERROR {
		t.Fatal("standalone changed")
	}
}
