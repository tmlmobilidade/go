package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopsStopAccess(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "stops_stop_access_field",
		table:         "stops",
		field:         "stop_access",
		run:           standard.StopAccessField,
		skipForbidden: true,
	})
}
