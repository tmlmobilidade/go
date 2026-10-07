package rules_test

import (
	"main/lib/rules/rules"
	"main/types"
	"reflect"
	"strings"
	"testing"
)

type unsupportedSection struct {
	Count int `json:"count"`
}

type unsupportedRoot struct {
	Section unsupportedSection `json:"section"`
}

func TestTypeScriptFailsOnUnsupportedTypes(t *testing.T) {
	if _, err := rules.RenderTypeScript(reflect.TypeOf(unsupportedRoot{}), nil); err == nil || !strings.Contains(err.Error(), "section.count has unsupported type int") {
		t.Fatalf("unsupported section field accepted: %v", err)
	}
}

func TestTypeScriptRejectsInconsistentCatalogue(t *testing.T) {
	root := reflect.TypeOf(types.GtfsRules{})
	for name, entry := range map[string]rules.CatalogueEntry{
		"unknown section":        {Group: "nope", ID: "x", ConfigKey: "_file", Editable: true},
		"unknown key":            {Group: "agency", ID: "x", ConfigKey: "nope", Editable: true},
		"editable with severity": {Group: "agency", ID: "x", ConfigKey: "_file", Editable: true, Severity: types.SEVERITY_ERROR},
		"fixed without severity": {Group: "agency", ID: "x"},
		"fixed with key":         {Group: "agency", ID: "x", ConfigKey: "_file", Severity: types.SEVERITY_ERROR},
		"unknown severity":       {Group: "agency", ID: "x", Severity: "info"},
	} {
		t.Run(name, func(t *testing.T) {
			if _, err := rules.RenderTypeScript(root, []rules.CatalogueEntry{entry}); err == nil {
				t.Fatal("inconsistent catalogue accepted")
			}
		})
	}
	duplicate := []rules.CatalogueEntry{{Group: "agency", ID: "x", Severity: types.SEVERITY_ERROR}, {Group: "stops", ID: "x", Severity: types.SEVERITY_ERROR}}
	if _, err := rules.RenderTypeScript(root, duplicate); err == nil {
		t.Fatal("duplicate ids accepted")
	}
}
