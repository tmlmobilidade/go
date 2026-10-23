package rules

import (
	"encoding/json"
	"main/types"
	"reflect"
	"regexp"
	"strings"
	"testing"
)

func TestDecodeEveryGeneratedRuleID(t *testing.T) {
	output, err := RenderTypeScript("../../validations")
	if err != nil {
		t.Fatal(err)
	}
	list := strings.Split(strings.Split(string(output["rule-ids.ts"]), "GtfsValidatorRuleIdValues = [")[1], "] as const;")[0]
	want := types.GtfsRules{}
	for _, match := range regexp.MustCompile(`'([^']+)'`).FindAllStringSubmatch(list, -1) {
		want[match[1]] = types.RuleContext{Severity: types.SEVERITY_IGNORE}
	}
	if len(want) == 0 {
		t.Fatal("empty generated rule list")
	}
	data, err := json.Marshal(want)
	if err != nil {
		t.Fatal(err)
	}
	got, err := DecodeConfig(data)
	if err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatal("the decoder did not preserve the complete flat rule list")
	}
}

func TestDecodeRejectsFileSections(t *testing.T) {
	_, err := DecodeConfig([]byte(`{"agency":{"agency_id_unique":{"severity":"warning"}}}`))
	if err == nil || !strings.Contains(err.Error(), `not by file section "agency"`) {
		t.Fatalf("expected a flat-format error, got %v", err)
	}
}
