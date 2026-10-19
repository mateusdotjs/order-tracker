package com.example.api.common;

import org.springframework.http.HttpStatus;

/**
 * Stable API error codes. Keep in sync with frontend/src/constants/errorMessages.ts (ErrorCode).
 */
public enum ErrorCode {

	VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "Validation failed"),
	INVALID_REQUEST_BODY(HttpStatus.BAD_REQUEST, "Invalid request body"),
	INVALID_STATUS(HttpStatus.BAD_REQUEST, "Invalid status value"),
	INVALID_PARAMETER(HttpStatus.BAD_REQUEST, "Invalid parameter"),
	UNAUTHENTICATED(HttpStatus.UNAUTHORIZED, "Unauthenticated"),
	INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Invalid credentials"),
	ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "Order not found"),
	EMAIL_ALREADY_USED(HttpStatus.CONFLICT, "Email already used"),
	INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal error");

	private final HttpStatus status;
	private final String message;

	ErrorCode(HttpStatus status, String message) {
		this.status = status;
		this.message = message;
	}

	public HttpStatus getStatus() {
		return status;
	}

	public String getMessage() {
		return message;
	}
}
