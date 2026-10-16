package rules_test

import (
	"bytes"
	"main/lib/rules/rules"
	"main/types"
	"reflect"
	"sort"
	"strings"
	"testing"
)

func TestTypeScriptIsDeterministic(t *testing.T) {
	first, err := rules.TypeScript()
	if err != nil {
		t.Fatal(err)
	}
	second, err := rules.TypeScript()
	if err != nil {
		t.Fatal(err)
	}
	if len(first) != 1 || len(second) != 1 {
		t.Fatal("generation must produce only rule-ids.ts")
	}
	content, ok := first["rule-ids.ts"]
	if !ok {
		t.Fatal("rule-ids.ts is missing")
	}
	if !bytes.Equal(content, second["rule-ids.ts"]) {
		t.Fatal("two runs produced different output")
	}
	for _, want := range []string{
		"/* * */\n\nimport { z } from 'zod';\n\n/* * */\n\n" + rules.TypeScriptHeader,
		"export const GtfsValidatorRuleIdValues = [",
		"export const GtfsValidatorRuleIdSchema = z\n\t.string()\n\t.transform(value => String(value).toLowerCase())\n\t.pipe(z.enum(GtfsValidatorRuleIdValues));",
		"export type GtfsValidatorRuleId = z.infer<typeof GtfsValidatorRuleIdSchema>;",
	} {
		if !bytes.Contains(content, []byte(want)) {
			t.Errorf("output is missing:\n%s", want)
		}
	}
}

func TestTypeScriptContainsOnlyCatalogueIDs(t *testing.T) {
	output, err := rules.TypeScript()
	if err != nil {
		t.Fatal(err)
	}
	var got []string
	for _, line := range strings.Split(string(output["rule-ids.ts"]), "\n") {
		if strings.HasPrefix(line, "\t'") && strings.HasSuffix(line, "',") {
			got = append(got, strings.TrimSuffix(strings.TrimPrefix(line, "\t'"), "',"))
		}
	}
	var want []string
	for _, entry := range rules.Catalogue() {
		want = append(want, entry.ID)
	}
	sort.Strings(want)
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("generated IDs differ from the catalogue:\ngot %v\nwant %v", got, want)
	}
}

func TestTypeScriptSortsAndEscapesIDs(t *testing.T) {
	catalogue := []rules.CatalogueEntry{
		{Group: "agency", ID: "z_rule", Severity: types.SEVERITY_ERROR},
		{Group: "agency", ID: "a'quoted", Severity: types.SEVERITY_WARNING},
	}
	output, err := rules.RenderTypeScript(reflect.TypeOf(types.GtfsRules{}), catalogue)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(output["rule-ids.ts"]), "\t'a\\'quoted',\n\t'z_rule',\n") {
		t.Fatal("IDs must be sorted and escaped as TypeScript strings")
	}
}
