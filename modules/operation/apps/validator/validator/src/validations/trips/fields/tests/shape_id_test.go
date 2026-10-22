package trips_fields_test

import (
	checks "main/validations/trips/fields/checks"
	testutils "main/validations/trips/utils"
	"testing"
)

func TestShapeIdField(t *testing.T) { testutils.CheckPresence(t, "shape_id", checks.ShapeIdField) }
