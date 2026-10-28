package trips_fields_test

import (
	checks "main/validations/trips/fields/checks"
	testutils "main/validations/trips/utils"
	"testing"
)

func TestDirectionIdField(t *testing.T) {
	testutils.CheckPresence(t, "direction_id", checks.DirectionIdField)
}
