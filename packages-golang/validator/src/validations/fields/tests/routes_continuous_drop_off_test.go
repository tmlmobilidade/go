package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestRoutesContinuousDropOffField(t *testing.T) {
	validationutils.RoutesCheckPresence(t, "continuous_drop_off", fields.RoutesContinuousDropOffField)
}
