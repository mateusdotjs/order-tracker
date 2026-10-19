package com.example.api.common;

/**
 * Stable field validation codes (values inside "errors"). Keep in sync with
 * frontend/src/constants/errorMessages.ts (FieldErrorCode).
 */
public enum FieldErrorCode {

	REQUIRED,
	INVALID_EMAIL,
	INVALID_SIZE,
	INVALID_VALUE,
	INVALID_FIELD
}
