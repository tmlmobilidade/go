package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopsPublicVisible(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_public_visible_field",
		table: "stops",
		field: "public_visible",
		run:   standard.PublicVisibleField,
	})
}
