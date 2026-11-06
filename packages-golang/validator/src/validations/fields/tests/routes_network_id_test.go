package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestNetworkIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "routes_network_id_field",
		table: "routes",
		field: "network_id",
		run:   fields.NetworkIdField,
	})
}
