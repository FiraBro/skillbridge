package auth

import "golang.org/x/crypto/bcrypt"

type BcryptHasher struct {
	saltRounds int
}

func NewBcryptHasher(saltRounds int) *BcryptHasher {
	return &BcryptHasher{saltRounds: saltRounds}
}

func (h *BcryptHasher) Hash(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), h.saltRounds)
	return string(hash), err
}
