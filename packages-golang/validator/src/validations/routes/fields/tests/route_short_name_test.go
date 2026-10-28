package routes_fields_test

import (
	checks "main/validations/routes/fields/checks"
	testutils "main/validations/routes/utils"
	"testing"
)

func TestRouteShortNameField(t *testing.T) {
	testutils.CheckPresence(t, "route_short_name", checks.RouteShortNameField)
}
