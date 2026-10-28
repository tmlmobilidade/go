package feed_info_standard_test

import (
	"main/types"
	checks "main/validations/feed_info/standard/checks"
	testutils "main/validations/feed_info/utils"
	"testing"
)

func TestDefaultLangValid(t *testing.T) {
	const id = "feed_info_default_lang_valid"
	for _, tc := range []struct {
		name  string
		value any
		count int
	}{{"Portuguese", "pt", 0},
		{"English", "en", 0},
		{"Uppercase", "PT", 0},
		{"Unknown", "zz", 1},
		{"RegionalTag", "pt-PT", 1},
		{"Whitespace", " pt ", 1},
		{"Empty", "", 1},
		{"Null", nil, 1},
		{"MissingColumn", nil, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			values := map[string]any{"default_lang": tc.value}
			if tc.name == "MissingColumn" {
				delete(values, "default_lang")
			}
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, values, config)
			if err := checks.DefaultLangValid(ctx, config.Rule("feed_info_default_lang_valid")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "default_lang", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "default_lang", checks.DefaultLangValid, map[string]any{"default_lang": "zz"})
}
