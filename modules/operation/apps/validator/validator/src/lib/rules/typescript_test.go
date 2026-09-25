package rules

import (
	"bytes"
	"main/types"
	"reflect"
	"strings"
	"testing"
)

func TestTypeScriptIsDeterministic(t *testing.T) {
	first, err := TypeScript()
	if err != nil {
		t.Fatal(err)
	}
	second, err := TypeScript()
	if err != nil {
		t.Fatal(err)
	}
	if len(first) != len(second) {
		t.Fatal("two runs produced different output")
	}
	wantFiles := map[string]string{
		"rules-severities.ts": "export const ruleSeverities",
		"rules-groups.ts":     "export const ruleConfigKeys",
		"rules-ids.ts":        "export const ruleIds",
		"rules-config.ts":     "export interface ValidationRules {",
		"rules-inputs.ts":     "export interface ValidationRulesInput {",
		"rules-catalogue.ts":  "export const ruleCatalogue",
	}
	if len(first) != len(wantFiles) {
		t.Fatalf("got %d files, want %d", len(first), len(wantFiles))
	}
	for name, declaration := range wantFiles {
		if !bytes.Contains(first[name], []byte(declaration)) {
			t.Errorf("%s is missing %s", name, declaration)
		}
		for otherName, content := range first {
			if otherName != name && bytes.Contains(content, []byte(declaration)) {
				t.Errorf("%s also appears in %s", declaration, otherName)
			}
		}
	}
	for name, content := range first {
		if !bytes.Equal(content, second[name]) {
			t.Errorf("two runs produced different output for %s", name)
		}
		if !bytes.HasPrefix(content, []byte(TypeScriptHeader)) {
			t.Errorf("%s does not start with the regeneration header", name)
		}
	}
}

func TestTypeScriptContainsTheGoContract(t *testing.T) {
	output, err := TypeScript()
	if err != nil {
		t.Fatal(err)
	}
	var combined strings.Builder
	for _, content := range output {
		combined.Write(content)
	}
	text := combined.String()
	for _, want := range []string{
		"export const ruleSeverities = ['error', 'warning', 'ignore', 'forbidden'] as const;",
		// Configuration keys match emitted rule IDs.
		"\t\tconfig_key: 'frequencies_trip_id_references_trips_table',\n\t\tdepends_on: ['frequencies_file_present'],\n\t\teditable: true,\n\t\tgroup: 'frequencies',\n\t\tid: 'frequencies_trip_id_references_trips_table',\n",
		// Calendar message-field mapping.
		"\t\tid: 'calendar_start_date_valid_yyyymmdd',\n\t\tmessage_field: 'start_date',\n\t\toutput_ids: ['calendar_start_end_dates_valid_yyyymmdd_order'],\n",
		// _file settings and fixed technical severities.
		"\t\tconfig_key: '_file',\n\t\teditable: true,\n\t\tgroup: 'agency',\n\t\tid: 'agency_file_missing',\n",
		"\t\tid: 'agency_values_parse',\n\t\tseverity: 'error',\n",
		"\t\tid: 'file_validation',\n\t\tseverities: ['error', 'ignore'],\n",
		"export interface RuleConfigInput {\n\tcompare?: null | RuleCompareInput[]\n\tdepends_on?: null | string[]\n\toptions?: null | string[]\n\tseverity?: RuleSeverity\n}",
		"export type RuleOutputId = 'calendar_start_end_dates_valid_yyyymmdd_order' | RuleId;",
	} {
		if !strings.Contains(text, want) {
			t.Errorf("output is missing:\n%s", want)
		}
	}
	for i := range reflect.TypeOf(types.GtfsRules{}).NumField() {
		name := reflect.TypeOf(types.GtfsRules{}).Field(i).Tag.Get("json")
		if !strings.Contains(text, "\t"+name+": [\n") {
			t.Errorf("section %s is missing from ruleConfigKeys", name)
		}
	}
	if strings.Contains(text, "file_validation_file_missing") {
		t.Error("file_validation._file must not become an editable file rule")
	}
}

type unsupportedSection struct {
	Count int `json:"count"`
}

type unsupportedRoot struct {
	Section unsupportedSection `json:"section"`
}

type unsupportedRuleField struct {
	Severity types.Severity `json:"severity"`
	Limit    int            `json:"limit"`
}

func TestTypeScriptFailsOnUnsupportedTypes(t *testing.T) {
	if _, err := renderTypeScript(reflect.TypeOf(unsupportedRoot{}), nil); err == nil || !strings.Contains(err.Error(), "section.count has unsupported type int") {
		t.Fatalf("unsupported section field accepted: %v", err)
	}
	w := &tsWriter{structs: map[string]reflect.Type{}}
	if err := w.collectStructs(reflect.TypeOf(unsupportedRuleField{}), "group.rule"); err == nil || !strings.Contains(err.Error(), "group.rule.limit has unsupported type int") {
		t.Fatalf("unsupported rule field accepted: %v", err)
	}
}

func TestTypeScriptRejectsInconsistentCatalogue(t *testing.T) {
	root := reflect.TypeOf(types.GtfsRules{})
	for name, entry := range map[string]CatalogueEntry{
		"unknown section":        {Group: "nope", ID: "x", ConfigKey: "_file", Editable: true},
		"unknown key":            {Group: "agency", ID: "x", ConfigKey: "nope", Editable: true},
		"editable with severity": {Group: "agency", ID: "x", ConfigKey: "_file", Editable: true, Severity: types.SEVERITY_ERROR},
		"fixed without severity": {Group: "agency", ID: "x"},
		"fixed with key":         {Group: "agency", ID: "x", ConfigKey: "_file", Severity: types.SEVERITY_ERROR},
		"unknown severity":       {Group: "agency", ID: "x", Severity: "info"},
	} {
		t.Run(name, func(t *testing.T) {
			if _, err := renderTypeScript(root, []CatalogueEntry{entry}); err == nil {
				t.Fatal("inconsistent catalogue accepted")
			}
		})
	}
	duplicate := []CatalogueEntry{{Group: "agency", ID: "x", Severity: types.SEVERITY_ERROR}, {Group: "stops", ID: "x", Severity: types.SEVERITY_ERROR}}
	if _, err := renderTypeScript(root, duplicate); err == nil {
		t.Fatal("duplicate ids accepted")
	}
}
