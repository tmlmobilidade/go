package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestSignpostedAsField(t *testing.T) {
	validationutils.PathwaysCheckPresence(t, "signposted_as", fields.SignpostedAsField)
}
