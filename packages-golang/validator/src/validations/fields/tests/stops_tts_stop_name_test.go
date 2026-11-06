package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestTtsStopNameField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_tts_stop_name_field",
		table: "stops",
		field: "tts_stop_name",
		run:   fields.TtsStopNameField,
	})
}
