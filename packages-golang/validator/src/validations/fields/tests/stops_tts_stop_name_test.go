package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestTtsStopNameField(t *testing.T) {
	validationutils.StopsCheckPresence(t, "tts_stop_name", fields.TtsStopNameField, 1)
}
