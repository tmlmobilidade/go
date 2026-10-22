package trips_fields_test

import (
	checks "main/validations/trips/fields/checks"
	testutils "main/validations/trips/utils"
	"testing"
)

func TestRouteIdField(t *testing.T) { testutils.CheckPresence(t, "route_id", checks.RouteIdField) }
