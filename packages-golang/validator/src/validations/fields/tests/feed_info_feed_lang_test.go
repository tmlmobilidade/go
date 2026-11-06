package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestFeedLangField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "feed_info_feed_lang_field",
		table: "feed_info",
		field: "feed_lang",
		run:   fields.FeedLangField,
	})
}
