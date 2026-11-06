package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopsTtsStopName(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_tts_stop_name_field",
		table: "stops",
		field: "tts_stop_name",
		run:   standard.TtsStopNameField,
	})
}
