package trips_fields_test

import (
	checks "main/validations/trips/fields/checks"
	testutils "main/validations/trips/utils"
	"testing"
)

func TestServiceIdField(t *testing.T) {
	testutils.CheckPresence(t, "service_id", checks.ServiceIdField)
}
