package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestHasNetworkMapField(t *testing.T) {
	testutils.CheckPresence(t, "has_network_map", checks.HasNetworkMapField, 1)
}
