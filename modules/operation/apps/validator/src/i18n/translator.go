// i18n/translator.go
package i18n

import (
	"embed"
	"encoding/json"
	"fmt"
)

//go:embed *.json
var embeddedFiles embed.FS

// Translator holds the flattened map of translations.
type Translator struct {
	translations map[string]string
	language     string
}

// NewTranslator creates a new Translator instance with the specified language.
func NewTranslator(lang string) *Translator {
	// Read the embedded JSON file
	data, err := embeddedFiles.ReadFile(fmt.Sprintf("%s.json", lang))
	if err != nil {
		// This is a panic because if the embedded file can't be read,
		// it's a compile-time issue, and the program cannot function.
		panic(fmt.Sprintf("i18n: failed to read embedded %s.json: %v", lang, err))
	}

	// Unmarshal into a temporary nested map
	var nestedMap map[string]interface{}
	if err := json.Unmarshal(data, &nestedMap); err != nil {
		panic(fmt.Sprintf("i18n: failed to unmarshal %s.json: %v", lang, err))
	}

	// Flatten the map for easy lookup
	flatMap := make(map[string]string)
	flattenJSON("", nestedMap, flatMap)

	return &Translator{
		translations: flatMap,
		language:     lang,
	}
}

// Get retrieves a translation for a given key (e.g., "agency_id_validation.required").
// It supports formatting arguments using fmt.Sprintf for placeholders like %s, %f, etc.
// If the key is not found, it returns the key itself as a fallback.
func (t *Translator) Get(key string, args ...interface{}) string {
	message, ok := t.translations[key]
	if !ok {
		// Fallback to returning the key so developers can see what's missing.
		return key
	}

	if len(args) > 0 {
		return fmt.Sprintf(message, args...)
	}

	return message
}

// SetLanguage changes the language and reloads the translations.
func (t *Translator) SetLanguage(lang string) {
	// Read the embedded JSON file
	data, err := embeddedFiles.ReadFile(fmt.Sprintf("%s.json", lang))
	if err != nil {
		panic(fmt.Sprintf("i18n: failed to read embedded %s.json: %v", lang, err))
	}

	// Unmarshal into a temporary nested map
	var nestedMap map[string]interface{}
	if err := json.Unmarshal(data, &nestedMap); err != nil {
		panic(fmt.Sprintf("i18n: failed to unmarshal %s.json: %v", lang, err))
	}

	// Flatten the map for easy lookup
	flatMap := make(map[string]string)
	flattenJSON("", nestedMap, flatMap)

	t.translations = flatMap
	t.language = lang
}

// flattenJSON is a recursive helper function to convert the nested JSON map
// into a flat map with dot-separated keys.
// e.g., {"a": {"b": "c"}} becomes {"a.b": "c"}
func flattenJSON(prefix string, data map[string]interface{}, flatMap map[string]string) {
	for key, value := range data {
		newKey := key
		if prefix != "" {
			newKey = prefix + "." + newKey
		}

		switch v := value.(type) {
		case string:
			flatMap[newKey] = v
		case map[string]interface{}:
			flattenJSON(newKey, v, flatMap)
		default:
			// You could log an error here if you expect only strings and nested maps.
			// For this specific JSON, this is sufficient.
		}
	}
}

// Global translator instance - defaults to English
var AppTranslator = NewTranslator("en")
