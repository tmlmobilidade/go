package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestPathwaysReversedSignpostedAs(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "pathways_reversed_signposted_as_field",
		table: "pathways",
		field: "reversed_signposted_as",
		run:   standard.ReversedSignpostedAsField,
	})
}
