package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestFeedInfoDefaultLang(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "feed_info_default_lang_field",
		table: "feed_info",
		field: "default_lang",
		run:   standard.DefaultLangField,
	})
}
