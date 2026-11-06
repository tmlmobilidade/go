package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestSignpostedAsField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "pathways_signposted_as_field",
		table: "pathways",
		field: "signposted_as",
		run:   fields.SignpostedAsField,
	})
}
