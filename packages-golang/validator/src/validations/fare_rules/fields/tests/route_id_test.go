package fare_rules_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_rules/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_rules/utils"
	"testing"
)

func TestRouteIdField(t *testing.T) { testutils.CheckPresence(t, "route_id", checks.RouteIdField) }
