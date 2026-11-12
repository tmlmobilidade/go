package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestToRouteIdField(t *testing.T) {
	check := fieldCheck{
		id:    "transfers_to_route_id_field",
		table: "transfers",
		field: "to_route_id",
		run:   fields.ToRouteIdField,
	}
	checkConditional(t, check, []string{"to_route_id", "to_trip_id"}, []conditionalCase{
		{name: "both_missing", values: []any{"", ""}, key: "recommended"},
		{name: "both_null", values: []any{nil, nil}, key: "recommended"},
		{name: "trip_identifies_route", values: []any{"", "T1"}, key: ""},
		{name: "route", values: []any{"R1", ""}, key: ""},
		{name: "route_and_trip", values: []any{"R1", "T1"}, key: ""},
	}, "recommended")
}
