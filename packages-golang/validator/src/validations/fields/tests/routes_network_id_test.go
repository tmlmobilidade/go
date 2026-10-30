package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestNetworkIdField(t *testing.T) {
	validationutils.RoutesCheckPresence(t, "network_id", fields.NetworkIdField)
}
