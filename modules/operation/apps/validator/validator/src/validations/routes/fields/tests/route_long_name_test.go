package routes_fields_test

import (
	checks "main/validations/routes/fields/checks"
	testutils "main/validations/routes/utils"
	"testing"
)

func TestRouteLongNameField(t *testing.T) {
	testutils.CheckPresence(t, "route_long_name", checks.RouteLongNameField)
}
