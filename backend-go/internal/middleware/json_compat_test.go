package middleware

import (
	"encoding/json"
	"testing"
)

func TestWithSnakeAliases(t *testing.T) {
	input := map[string]interface{}{
		"coverImage": "image.png",
		"developer":  map[string]interface{}{"avatarUrl": "avatar.png"},
	}
	encoded, err := json.Marshal(withSnakeAliases(input))
	if err != nil {
		t.Fatal(err)
	}
	var result map[string]interface{}
	if err := json.Unmarshal(encoded, &result); err != nil {
		t.Fatal(err)
	}
	if result["coverImage"] != "image.png" || result["cover_image"] != "image.png" {
		t.Fatalf("expected camelCase and snake_case cover image keys, got %s", encoded)
	}
	developer := result["developer"].(map[string]interface{})
	if developer["avatarUrl"] != "avatar.png" || developer["avatar_url"] != "avatar.png" {
		t.Fatalf("expected camelCase and snake_case nested avatar keys, got %s", encoded)
	}
}
