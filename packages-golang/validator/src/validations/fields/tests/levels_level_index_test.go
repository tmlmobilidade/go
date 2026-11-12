package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestLevelIndexField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "levels_level_index_field",
		table: "levels",
		field: "level_index",
		run:   fields.LevelIndexField,
	})
}
