package routes_fields_test

import (
	checks "main/validations/routes/fields/checks"
	testutils "main/validations/routes/utils"
	"testing"
)

func TestNetworkIdField(t *testing.T) {
	testutils.CheckPresence(t, "network_id", checks.NetworkIdField)
}
