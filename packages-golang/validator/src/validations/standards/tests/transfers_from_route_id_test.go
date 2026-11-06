package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestTransfersFromRouteId(t *testing.T) {
	check := standardCheck{
		id:    "transfers_from_route_id_field",
		table: "transfers",
		field: "from_route_id",
		run:   standard.FromRouteIdField,
	}
	checkConditional(t, check, []string{"from_route_id", "from_trip_id"}, []conditionalCase{
		{name: "both_missing", values: []any{"", ""}, key: "recommended"},
		{name: "both_null", values: []any{nil, nil}, key: "recommended"},
		{name: "trip_identifies_route", values: []any{"", "T1"}, key: ""},
		{name: "route", values: []any{"R1", ""}, key: ""},
		{name: "route_and_trip", values: []any{"R1", "T1"}, key: ""},
	}, "recommended")
}
