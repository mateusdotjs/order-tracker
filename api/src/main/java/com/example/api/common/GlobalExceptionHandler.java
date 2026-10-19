package com.example.api.common;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.example.api.auth.exceptions.InvalidCredentialsException;
import com.example.api.orders.exceptions.OrderNotFoundException;
import com.example.api.users.exceptions.EmailAlreadyUsedException;
import com.example.api.users.exceptions.UserNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
		Map<String, String> errors = new LinkedHashMap<>();
		for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
			errors.put(fieldError.getField(), mapFieldErrorCode(fieldError).name());
		}
		return ResponseEntity.status(ErrorCode.VALIDATION_FAILED.getStatus())
				.body(ErrorResponse.of(ErrorCode.VALIDATION_FAILED, errors));
	}

	@ExceptionHandler(OrderNotFoundException.class)
	public ResponseEntity<ErrorResponse> handleOrderNotFound(OrderNotFoundException ex) {
		return ResponseEntity.status(ErrorCode.ORDER_NOT_FOUND.getStatus())
				.body(ErrorResponse.of(ErrorCode.ORDER_NOT_FOUND));
	}

	@ExceptionHandler(EmailAlreadyUsedException.class)
	public ResponseEntity<ErrorResponse> handleEmailAlreadyUsed(EmailAlreadyUsedException ex) {
		return ResponseEntity.status(ErrorCode.EMAIL_ALREADY_USED.getStatus())
				.body(ErrorResponse.of(ErrorCode.EMAIL_ALREADY_USED));
	}

	@ExceptionHandler(InvalidCredentialsException.class)
	public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex) {
		return ResponseEntity.status(ErrorCode.INVALID_CREDENTIALS.getStatus())
				.body(ErrorResponse.of(ErrorCode.INVALID_CREDENTIALS));
	}

	@ExceptionHandler(UserNotFoundException.class)
	public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
		log.warn("User not found for authenticated subject: {}", ex.getMessage());
		return ResponseEntity.status(ErrorCode.UNAUTHENTICATED.getStatus())
				.body(ErrorResponse.of(ErrorCode.UNAUTHENTICATED));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ErrorResponse> handleNotReadable(HttpMessageNotReadableException ex) {
		ErrorCode code = ErrorCode.INVALID_REQUEST_BODY;
		String detail = ex.getMostSpecificCause().getMessage();
		if (detail != null && detail.contains("OrderStatus")) {
			code = ErrorCode.INVALID_STATUS;
		}
		return ResponseEntity.status(code.getStatus()).body(ErrorResponse.of(code));
	}

	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
		return ResponseEntity.status(ErrorCode.INVALID_PARAMETER.getStatus())
				.body(ErrorResponse.of(ErrorCode.INVALID_PARAMETER));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
		log.error("Unhandled exception", ex);
		return ResponseEntity.status(ErrorCode.INTERNAL_ERROR.getStatus())
				.body(ErrorResponse.of(ErrorCode.INTERNAL_ERROR));
	}

	private static FieldErrorCode mapFieldErrorCode(FieldError fieldError) {
		String code = fieldError.getCode();
		if (code == null) {
			return FieldErrorCode.INVALID_FIELD;
		}
		return switch (code) {
			case "NotBlank", "NotEmpty", "NotNull" -> FieldErrorCode.REQUIRED;
			case "Email" -> FieldErrorCode.INVALID_EMAIL;
			case "Size" -> FieldErrorCode.INVALID_SIZE;
			case "Min", "Max", "DecimalMin", "DecimalMax", "Digits", "Positive" -> FieldErrorCode.INVALID_VALUE;
			default -> FieldErrorCode.INVALID_FIELD;
		};
	}
}
