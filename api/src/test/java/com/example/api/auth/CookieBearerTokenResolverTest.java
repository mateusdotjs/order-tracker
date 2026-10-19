package com.example.api.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class CookieBearerTokenResolverTest {

	private CookieBearerTokenResolver resolver;

	@BeforeEach
	void setUp() {
		resolver = new CookieBearerTokenResolver();
	}

	@Test
	void resolve_returnsNullOnPublicAuthPostRoutes() {
		MockHttpServletRequest request = new MockHttpServletRequest("POST", "/auth/login");

		assertThat(resolver.resolve(request)).isNull();
	}

	@Test
	void resolve_returnsNullWhenNoCookiesOnProtectedRoute() {
		MockHttpServletRequest request = new MockHttpServletRequest("GET", "/orders");

		assertThat(resolver.resolve(request)).isNull();
	}

	@Test
	void resolve_returnsTokenFromAccessTokenCookie() {
		MockHttpServletRequest request = new MockHttpServletRequest("GET", "/orders");
		request.setCookies(new jakarta.servlet.http.Cookie(AccessTokenCookieHelper.COOKIE_NAME, "jwt-token"));

		assertThat(resolver.resolve(request)).isEqualTo("jwt-token");
	}

	@Test
	void resolve_returnsNullWhenAccessTokenCookieIsBlank() {
		MockHttpServletRequest request = new MockHttpServletRequest("GET", "/orders");
		request.setCookies(new jakarta.servlet.http.Cookie(AccessTokenCookieHelper.COOKIE_NAME, "   "));

		assertThat(resolver.resolve(request)).isNull();
	}
}
