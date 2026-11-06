package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestHeadwaySecsField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "frequencies_headway_secs_field",
		table: "frequencies",
		field: "headway_secs",
		run:   fields.HeadwaySecsField,
	})
}
