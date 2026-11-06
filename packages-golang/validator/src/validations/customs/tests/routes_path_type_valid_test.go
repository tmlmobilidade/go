package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/checks"
	"testing"
)

func TestRoutesPathTypeValid(t *testing.T) {
	checkCustom(t, customCheck{id: "routes_path_type_valid", table: "routes", field: "path_type", run: custom.PathTypeValid, skipForbidden: false, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"routes": {
				{"path_type": "2"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"routes": {
				{"path_type": "4"},
			},
		}, wantRows: []int{1}},
	})
}
