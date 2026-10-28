package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestDefaultLangField(t *testing.T) {
	validationutils.FeedInfoCheckPresence(t, "default_lang", fields.DefaultLangField)
}
