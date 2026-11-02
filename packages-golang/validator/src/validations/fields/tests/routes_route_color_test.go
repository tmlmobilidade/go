package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestRouteColorField(t *testing.T) {
	validationutils.RoutesCheckPresence(t, "route_color", fields.RouteColorField)
}
