package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestTripsRouteIdField(t *testing.T) {
	validationutils.TripsCheckPresence(t, "route_id", fields.TripsRouteIdField)
}
