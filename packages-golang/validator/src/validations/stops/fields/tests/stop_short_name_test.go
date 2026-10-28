package stops_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"testing"
)

func TestStopShortNameField(t *testing.T) {
	testutils.CheckPresence(t, "stop_short_name", checks.StopShortNameField, 1)
}
