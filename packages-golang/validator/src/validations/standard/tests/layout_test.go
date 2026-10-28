package standard_test

import (
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
)

// A check can compile without being registered. Keep every category's checks
// in the single DAG entry point and prevent GTFS-specific folders returning.
func TestFlatValidationLayoutAndCheckBindings(t *testing.T) {
	root := filepath.Join("..", "..")
	categories := map[string]bool{"custom": true, "fields": true, "standard": true, "utils": true}
	entries, err := os.ReadDir(root)
	if err != nil {
		t.Fatal(err)
	}
	for _, entry := range entries {
		if entry.IsDir() && !categories[entry.Name()] {
			t.Errorf("unexpected validation directory: %s", entry.Name())
		}
	}
	for category := range categories {
		info, err := os.Stat(filepath.Join(root, category))
		if err != nil || !info.IsDir() {
			t.Fatalf("missing %s directory", category)
		}
	}
	main, err := parser.ParseFile(token.NewFileSet(), filepath.Join(root, "main.go"), nil, 0)
	if err != nil {
		t.Fatal(err)
	}
	imports := map[string]string{}
	for _, spec := range main.Imports {
		path, err := strconv.Unquote(spec.Path.Value)
		if err != nil {
			t.Fatal(err)
		}
		alias := filepath.Base(path)
		if spec.Name != nil {
			alias = spec.Name.Name
		}
		imports[alias] = path
	}
	called := map[string]bool{}
	hasDAG := false
	ast.Inspect(main, func(node ast.Node) bool {
		call, ok := node.(*ast.CallExpr)
		if !ok {
			return true
		}
		target := call.Fun
		if generic, ok := target.(*ast.IndexExpr); ok {
			target = generic.X
		}
		selector, ok := target.(*ast.SelectorExpr)
		if !ok {
			return true
		}
		alias, ok := selector.X.(*ast.Ident)
		if !ok {
			return true
		}
		called[imports[alias.Name]+"."+selector.Sel.Name] = true
		if selector.Sel.Name == "NewRuleRunner" || selector.Sel.Name == "NewManager" {
			hasDAG = true
		}
		return true
	})
	if !hasDAG {
		t.Fatal("main.go must construct the validation DAG")
	}
	for _, category := range []string{"custom", "fields", "standard"} {
		for _, kind := range []string{"checks", "tests"} {
			path := filepath.Join(root, category, kind)
			entries, err := os.ReadDir(path)
			if err != nil {
				t.Fatal(err)
			}
			for _, entry := range entries {
				if entry.IsDir() {
					t.Errorf("%s must be flat, found %s", path, entry.Name())
				}
			}
		}
		files, err := filepath.Glob(filepath.Join(root, category, "checks", "*.go"))
		if err != nil {
			t.Fatal(err)
		}
		for _, file := range files {
			if strings.HasSuffix(file, "_test.go") {
				continue
			}
			source, err := parser.ParseFile(token.NewFileSet(), file, nil, 0)
			if err != nil {
				t.Fatal(err)
			}
			for _, decl := range source.Decls {
				fn, ok := decl.(*ast.FuncDecl)
				if !ok || fn.Recv != nil || !fn.Name.IsExported() {
					continue
				}
				importPath := "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/" + category + "/checks"
				if !called[importPath+"."+fn.Name.Name] {
					t.Errorf("%s.%s is not bound in main.go", category, fn.Name.Name)
				}
			}
		}
	}
}
