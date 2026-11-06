package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestFrequenciesStartTime(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "frequencies_start_time_field",
		table: "frequencies",
		field: "start_time",
		run:   standard.StartTimeField,
	})
}
