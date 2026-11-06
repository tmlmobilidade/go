package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestDefaultLangField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "feed_info_default_lang_field",
		table: "feed_info",
		field: "default_lang",
		run:   fields.DefaultLangField,
	})
}
