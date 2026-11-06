package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestPathwaysSignpostedAs(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "pathways_signposted_as_field",
		table: "pathways",
		field: "signposted_as",
		run:   standard.SignpostedAsField,
	})
}
