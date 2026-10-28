package stops_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"testing"
)

func TestHasNetworkMapField(t *testing.T) {
	testutils.CheckPresence(t, "has_network_map", checks.HasNetworkMapField, 1)
}
