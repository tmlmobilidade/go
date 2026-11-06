package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestPublicVisibleField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_public_visible_field",
		table: "stops",
		field: "public_visible",
		run:   fields.PublicVisibleField,
	})
}
