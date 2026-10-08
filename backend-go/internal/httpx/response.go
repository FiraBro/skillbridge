package httpx

import "github.com/gin-gonic/gin"

// Envelope matches apps/api src/modules/utils/apiResponse.js
type SuccessBody struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

type ErrorBody struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

func Success(c *gin.Context, status int, data interface{}, message string) {
	if message == "" {
		message = "Success"
	}
	c.JSON(status, SuccessBody{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func Fail(c *gin.Context, status int, message string) {
	c.JSON(status, ErrorBody{
		Status:  "error",
		Message: message,
	})
}
