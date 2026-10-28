package stops_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"testing"
)

func TestHasStopSignField(t *testing.T) {
	testutils.CheckPresence(t, "has_stop_sign", checks.HasStopSignField, 1)
}
