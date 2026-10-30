package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestHasNetworkMapField(t *testing.T) {
	validationutils.StopsCheckPresence(t, "has_network_map", fields.HasNetworkMapField, 1)
}
