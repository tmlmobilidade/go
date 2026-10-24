package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestPlatformCodeField(t *testing.T) {
	testutils.CheckPresence(t, "platform_code", checks.PlatformCodeField, 1)
}
