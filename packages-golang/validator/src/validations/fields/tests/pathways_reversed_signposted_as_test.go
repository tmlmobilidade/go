package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestReversedSignpostedAsField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "pathways_reversed_signposted_as_field",
		table: "pathways",
		field: "reversed_signposted_as",
		run:   fields.ReversedSignpostedAsField,
	})
}
