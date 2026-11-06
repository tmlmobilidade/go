package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestRoutesNetworkId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "routes_network_id_field",
		table: "routes",
		field: "network_id",
		run:   standard.NetworkIdField,
	})
}
