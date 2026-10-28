package stop_times_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stop_times/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stop_times/utils"
	"testing"
)

func TestDepartureTimeField(t *testing.T) {
	testutils.CheckPresence(t, "departure_time", checks.DepartureTimeField)
}
