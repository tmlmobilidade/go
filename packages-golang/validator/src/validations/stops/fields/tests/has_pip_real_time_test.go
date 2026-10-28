package stops_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"testing"
)

func TestHasPipRealTimeField(t *testing.T) {
	testutils.CheckPresence(t, "has_pip_real_time", checks.HasPipRealTimeField, 1)
}
