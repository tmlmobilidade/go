package rules

import (
	"main/types"
	"reflect"
	"sort"
)

// Severities lists every accepted severity, in the order editors offer them.
var Severities = []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_IGNORE, types.SEVERITY_FORBIDDEN}

// CatalogueEntry maps an output rule to its stored agency configuration.
type CatalogueEntry struct {
	DependsOn    []string         `json:"depends_on,omitempty"`
	OutputIDs    []string         `json:"output_ids,omitempty"`
	MessageField string           `json:"message_field,omitempty"`
	Severities   []types.Severity `json:"severities,omitempty"`
	Group        string           `json:"group"`
	ID           string           `json:"id"`
	ConfigKey    string           `json:"config_key,omitempty"`
	Editable     bool             `json:"editable"`
	Severity     types.Severity   `json:"severity,omitempty"`
}

// Catalogue derives editable entries from the same structs used to parse rules.
func Catalogue() []CatalogueEntry {
	entries := []CatalogueEntry{}
	groups := reflect.TypeOf(types.GtfsRules{})
	for i := range groups.NumField() {
		group := groups.Field(i)
		name := group.Tag.Get("json")
		for j := range group.Type.NumField() {
			field := group.Type.Field(j)
			key := field.Tag.Get("json")
			if field.Type == ruleConfigType {
				entry := CatalogueEntry{Group: name, ID: key, ConfigKey: key, Editable: true, DependsOn: DefaultDependencies(name, key)}
				if name == "calendar" && (key == "calendar_start_date_valid_yyyymmdd" || key == "calendar_end_date_valid_yyyymmdd") {
					entry.OutputIDs = []string{"calendar_start_end_dates_valid_yyyymmdd_order"}
					if key == "calendar_start_date_valid_yyyymmdd" {
						entry.MessageField = "start_date"
					} else {
						entry.MessageField = "end_date"
					}
				}
				entries = append(entries, entry)
			} else if key == "_file" && name != "file_validation" {
				entries = append(entries, CatalogueEntry{Group: name, ID: name + "_file_missing", ConfigKey: key, Editable: true})
			}
		}
	}
	for _, group := range []string{"agency", "frequencies", "rider_categories", "shapes", "vehicles", "transfers", "calendar", "calendar_dates", "fare_attributes", "fare_media", "fare_rules", "feed_info", "pathways", "routes", "stop_times", "stops", "trips"} {
		entries = append(entries, CatalogueEntry{Group: group, ID: group + "_values_parse", Severity: types.SEVERITY_ERROR})
	}
	entries = append(entries,
		CatalogueEntry{Group: "levels", ID: "levels_parse", Severity: types.SEVERITY_ERROR},
		CatalogueEntry{Group: "file_validation", ID: "file_validation", Severities: []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_IGNORE}},
		CatalogueEntry{Group: "file_validation", ID: "file_not_found_in_rules", Severity: types.SEVERITY_WARNING},
	)
	sort.Slice(entries, func(i, j int) bool {
		if entries[i].Group != entries[j].Group {
			return entries[i].Group < entries[j].Group
		}
		return entries[i].ID < entries[j].ID
	})
	return entries
}

// DefaultConfig fills omitted settings before JSON decoding; explicit invalid values
// still replace these defaults and are rejected by the parser.
func DefaultConfig() types.GtfsRules {
	result := types.GtfsRules{}
	groups := reflect.ValueOf(&result).Elem()
	for i := range groups.NumField() {
		group := groups.Field(i)
		for j := range group.NumField() {
			field := group.Field(j)
			if field.Type() == ruleConfigType {
				field.Set(reflect.ValueOf(types.RuleConfig{Severity: types.SEVERITY_IGNORE, DependsOn: DefaultDependencies(groups.Type().Field(i).Tag.Get("json"), group.Type().Field(j).Tag.Get("json"))}))
			} else if field.Type() == reflect.TypeOf(types.Severity("")) {
				field.SetString(string(types.SEVERITY_IGNORE))
			}
		}
	}
	return result
}

func FileSeverity(config *types.GtfsRules, groupName string) types.Severity {
	if config == nil {
		return types.SEVERITY_IGNORE
	}
	groups := reflect.ValueOf(config).Elem()
	for i := range groups.NumField() {
		if groups.Type().Field(i).Tag.Get("json") == groupName {
			return types.Severity(groups.Field(i).FieldByName("File").String())
		}
	}
	return types.SEVERITY_IGNORE
}
