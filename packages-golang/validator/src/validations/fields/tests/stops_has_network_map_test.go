package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestHasNetworkMapField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_has_network_map_field",
		table: "stops",
		field: "has_network_map",
		run:   fields.HasNetworkMapField,
	})
}
