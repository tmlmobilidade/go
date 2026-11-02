package utils

import (
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/rules/algorithm/types"
)

func Pending[T any](m *types.Manager[T], done []bool) string {
	ids := []string{}
	for i, r := range m.Rules {
		if !done[i] {
			ids = append(ids, r.ID)
		}
	}
	return strings.Join(ids, ", ")
}