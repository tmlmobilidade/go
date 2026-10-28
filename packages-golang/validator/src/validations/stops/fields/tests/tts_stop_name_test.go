package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestTtsStopNameField(t *testing.T) {
	testutils.CheckPresence(t, "tts_stop_name", checks.TtsStopNameField, 1)
}
