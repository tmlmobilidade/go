package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestPublicVisibleField(t *testing.T) {
	testutils.CheckPresence(t, "public_visible", checks.PublicVisibleField, 1)
}
