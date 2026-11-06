package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopsPlatformCode(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_platform_code_field",
		table: "stops",
		field: "platform_code",
		run:   standard.PlatformCodeField,
	})
}
