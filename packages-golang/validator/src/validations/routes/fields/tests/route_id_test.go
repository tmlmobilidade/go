package routes_fields_test

import (
	checks "main/validations/routes/fields/checks"
	testutils "main/validations/routes/utils"
	"testing"
)

func TestRouteIdField(t *testing.T) { testutils.CheckPresence(t, "route_id", checks.RouteIdField) }
