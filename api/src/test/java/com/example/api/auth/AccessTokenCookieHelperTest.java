package com.example.api.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;

class AccessTokenCookieHelperTest {

	private final AccessTokenCookieHelper helper = new AccessTokenCookieHelper(false, 15L);

	@Test
	void buildSetCookie_hasExpectedAttributes() {
		ResponseCookie cookie = helper.buildSetCookie("jwt-token");

		assertThat(cookie.getName()).isEqualTo(AccessTokenCookieHelper.COOKIE_NAME);
		assertThat(cookie.getValue()).isEqualTo("jwt-token");
		assertThat(cookie.isHttpOnly()).isTrue();
		assertThat(cookie.isSecure()).isFalse();
		assertThat(cookie.getSameSite()).isEqualTo("Strict");
		assertThat(cookie.getPath()).isEqualTo("/");
		assertThat(cookie.getMaxAge().getSeconds()).isEqualTo(15 * 60);
	}

	@Test
	void buildClearCookie_expiresImmediately() {
		ResponseCookie cookie = helper.buildClearCookie();

		assertThat(cookie.getName()).isEqualTo(AccessTokenCookieHelper.COOKIE_NAME);
		assertThat(cookie.getValue()).isEmpty();
		assertThat(cookie.getMaxAge().getSeconds()).isZero();
	}
}
