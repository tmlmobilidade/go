package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestPlatformCodeField(t *testing.T) {
	validationutils.StopsCheckPresence(t, "platform_code", fields.PlatformCodeField, 1)
}
