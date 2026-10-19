package feed_info_fields_test

import (
	checks "main/validations/feed_info/fields/checks"
	testutils "main/validations/feed_info/utils"
	"testing"
)

func TestDefaultLangField(t *testing.T) {
	testutils.CheckPresence(t, "default_lang", checks.DefaultLangField)
}
