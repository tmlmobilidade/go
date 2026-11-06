package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/checks"
	"testing"
)

func TestTripsPatternIdFormat(t *testing.T) {
	checkCustom(t, customCheck{id: "trips_pattern_id_format", table: "trips", field: "pattern_id", run: custom.PatternIdFormat, skipForbidden: true, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "1001_0_1"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "invalid"},
			},
		}, wantRows: []int{1}},
		{name: "configured_regex", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "PAT-42"},
			},
		}, options: []string{"^PAT-[0-9]+$"}},
		{name: "invalid_regex_fallback", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "1001_0_1"},
			},
		}, options: []string{"["}},
	})
}
