package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestFrequenciesHeadwaySecs(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "frequencies_headway_secs_field",
		table: "frequencies",
		field: "headway_secs",
		run:   standard.HeadwaySecsField,
	})
}
