package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestPlatformCodeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_platform_code_field",
		table: "stops",
		field: "platform_code",
		run:   fields.PlatformCodeField,
	})
}
