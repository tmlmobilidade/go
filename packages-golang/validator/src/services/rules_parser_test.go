package services

import (
	"main/types"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestParseRulesLooksUpRuleIDDirectly(t *testing.T) {
	for _, wrapped := range []bool{false, true} {
		input := `{"agency_id_unique":{"severity":"warning","options":["1"],"compare":[{"key":"1","value":"Carris"}]}}`
		if wrapped {
			input = `{"validation_rules":` + input + `}`
		}
		path := filepath.Join(t.TempDir(), "rules.json")
		if err := os.WriteFile(path, []byte(input), 0600); err != nil {
			t.Fatal(err)
		}
		rules, err := ParseRulesFromFile(path)
		if err != nil {
			t.Fatal(err)
		}
		context, exists := (*rules)["agency_id_unique"]
		if !exists || len(*rules) != 1 || context.Severity != types.SEVERITY_WARNING {
			t.Fatalf("expected a direct agency_id_unique entry, got %#v", rules)
		}
		if context.Options == nil || len(*context.Options) != 1 || (*context.Options)[0] != "1" {
			t.Fatalf("options were not preserved: %#v", context.Options)
		}
		if context.Compare == nil || len(*context.Compare) != 1 || (*context.Compare)[0] != (types.Compare{Key: "1", Value: "Carris"}) {
			t.Fatalf("compare was not preserved: %#v", context.Compare)
		}
		if rules.Rule("agency_id_unique").Severity != types.SEVERITY_WARNING {
			t.Fatal("rule lookup lost the configured severity")
		}
	}
}

func TestParseRulesErrorsUseDirectRuleID(t *testing.T) {
	path := filepath.Join(t.TempDir(), "rules.json")
	if err := os.WriteFile(path, []byte(`{"agency_id_unique":{"severity":"invalid"}}`), 0600); err != nil {
		t.Fatal(err)
	}
	_, err := ParseRulesFromFile(path)
	if err == nil || !strings.Contains(err.Error(), `agency_id_unique: invalid severity "invalid"`) || strings.Contains(err.Error(), "agency.agency_id_unique") {
		t.Fatalf("expected an error on the direct rule ID, got %v", err)
	}
}
