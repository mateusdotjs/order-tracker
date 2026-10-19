package com.example.api.auth;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class AccessTokenCookieHelper {

	public static final String COOKIE_NAME = "access_token";

	private final boolean cookieSecure;
	private final Duration maxAge;

	public AccessTokenCookieHelper(
			@Value("${app.jwt.cookie-secure}") boolean cookieSecure,
			@Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
		this.cookieSecure = cookieSecure;
		this.maxAge = Duration.ofMinutes(expirationMinutes);
	}

	public ResponseCookie buildSetCookie(String token) {
		return baseCookie(token).maxAge(maxAge).build();
	}

	public ResponseCookie buildClearCookie() {
		return baseCookie("").maxAge(Duration.ZERO).build();
	}

	private ResponseCookie.ResponseCookieBuilder baseCookie(String value) {
		return ResponseCookie.from(COOKIE_NAME, value)
				.httpOnly(true)
				.secure(cookieSecure)
				.sameSite("Strict")
				.path("/");
	}
}
