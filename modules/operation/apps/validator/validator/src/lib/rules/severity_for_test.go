package rules

import (
	"encoding/json"
	"main/types"
	"testing"
)

func TestSeverityFor(t *testing.T) {
	for _, tc := range []struct {
		name, input, id string
		want            types.Severity
	}{
		{"configured", `{"calendar_start_end_dates_valid_format":{"severity":"warning"}}`, "calendar_start_end_dates_valid_format", types.SEVERITY_WARNING},
		{"missing", `{}`, "calendar_start_end_dates_valid_format", types.SEVERITY_IGNORE},
		{"empty", `{"calendar_start_end_dates_valid_format":{}}`, "calendar_start_end_dates_valid_format", types.SEVERITY_IGNORE},
		{"unknown", `{}`, "unknown_rule", types.SEVERITY_IGNORE},
	} {
		t.Run(tc.name, func(t *testing.T) {
			var section types.GtfsRules
			if err := json.Unmarshal([]byte(tc.input), &section); err != nil {
				t.Fatal(err)
			}
			if got := SeverityFor(&section, tc.id); got != tc.want {
				t.Fatalf("got %s, want %s", got, tc.want)
			}
		})
	}
	var section *types.GtfsRules
	if got := SeverityFor(section, "calendar_start_end_dates_valid_format"); got != types.SEVERITY_IGNORE {
		t.Fatalf("nil config: got %s", got)
	}
}
