package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestStopUrlValid(t *testing.T) {
	validationutils.StopsCheckCases(t, "stops_stop_url_valid", "stop_url", standard.StopUrlValid, []validationutils.StopsCase{
		{Name: "HTTPS", Values: map[string]any{"stop_url": "https://example.com/stop/1"}},
		{Name: "HTTP", Values: map[string]any{"stop_url": "http://example.com"}},
		{Name: "Query", Values: map[string]any{"stop_url": "https://example.com/?stop=1&lang=pt"}},
		{Name: "Encoded", Values: map[string]any{"stop_url": "https://example.com/a%20b"}},
		{Name: "Trimmed", Values: map[string]any{"stop_url": " https://example.com "}},
		{Name: "NoScheme", Values: map[string]any{"stop_url": "example.com"}, Count: 1},
		{Name: "Relative", Values: map[string]any{"stop_url": "/stops/1"}, Count: 1},
		{Name: "FTP", Values: map[string]any{"stop_url": "ftp://example.com"}, Count: 1},
		{Name: "NoHost", Values: map[string]any{"stop_url": "https:///stop"}, Count: 1},
		{Name: "BadEscape", Values: map[string]any{"stop_url": "https://example.com/%zz"}, Count: 1},
		{Name: "Space", Values: map[string]any{"stop_url": "https://example.com/a b"}, Count: 1},
		{Name: "Empty", Values: map[string]any{"stop_url": ""}, Count: 1},
		{Name: "Null", Values: map[string]any{"stop_url": nil}, Count: 1},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1},
	})
}
