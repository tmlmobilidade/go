package rules

import (
	"go/ast"
	"go/parser"
	"go/token"
	"io/fs"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
)

// Individual validation tests do not exercise the runner's action bindings.
func TestValidationActionBindingsMatchConfiguration(t *testing.T) {
	known := map[string]map[string]bool{}
	for _, entry := range Catalogue() {
		if known[entry.Group] == nil {
			known[entry.Group] = map[string]bool{}
		}
		if entry.Editable {
			known[entry.Group][entry.ConfigKey] = true
		}
	}
	root := filepath.Join("..", "..", "validations")
	bindings := 0
	err := filepath.WalkDir(root, func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if entry.IsDir() || !strings.HasSuffix(path, ".go") || strings.HasSuffix(path, "_test.go") {
			return nil
		}
		relative, err := filepath.Rel(root, path)
		if err != nil {
			return err
		}
		group := strings.Split(filepath.ToSlash(relative), "/")[0]
		file, err := parser.ParseFile(token.NewFileSet(), path, nil, 0)
		if err != nil {
			return err
		}
		ast.Inspect(file, func(node ast.Node) bool {
			literal, ok := node.(*ast.CompositeLit)
			if !ok {
				return true
			}
			selector, ok := literal.Type.(*ast.SelectorExpr)
			if !ok || selector.Sel.Name != "RuleActions" {
				return true
			}
			for _, element := range literal.Elts {
				pair, ok := element.(*ast.KeyValueExpr)
				if !ok {
					continue
				}
				key, ok := pair.Key.(*ast.BasicLit)
				if !ok || key.Kind != token.STRING {
					continue
				}
				id, err := strconv.Unquote(key.Value)
				if err != nil {
					t.Fatal(err)
				}
				bindings++
				if !known[group][id] {
					t.Errorf("%s binds unknown %s rule %q", path, group, id)
				}
			}
			return true
		})
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if bindings == 0 {
		t.Fatal("no validation action bindings checked")
	}
}
