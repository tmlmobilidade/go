package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestRouteTypeField(t *testing.T) {
	validationutils.RoutesCheckPresence(t, "route_type", fields.RouteTypeField)
}
