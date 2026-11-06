package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestFrequenciesEndTime(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "frequencies_end_time_field",
		table: "frequencies",
		field: "end_time",
		run:   standard.EndTimeField,
	})
}
