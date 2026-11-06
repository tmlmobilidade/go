package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestTransfersToRouteId(t *testing.T) {
	check := standardCheck{
		id:    "transfers_to_route_id_field",
		table: "transfers",
		field: "to_route_id",
		run:   standard.ToRouteIdField,
	}
	checkConditional(t, check, []string{"to_route_id", "to_trip_id"}, []conditionalCase{
		{name: "both_missing", values: []any{"", ""}, key: "recommended"},
		{name: "both_null", values: []any{nil, nil}, key: "recommended"},
		{name: "trip_identifies_route", values: []any{"", "T1"}, key: ""},
		{name: "route", values: []any{"R1", ""}, key: ""},
		{name: "route_and_trip", values: []any{"R1", "T1"}, key: ""},
	}, "recommended")
}
