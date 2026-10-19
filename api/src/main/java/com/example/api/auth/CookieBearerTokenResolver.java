package com.example.api.auth;

import org.springframework.http.HttpMethod;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class CookieBearerTokenResolver implements BearerTokenResolver {

	@Override
	public String resolve(HttpServletRequest request) {
		if (isPublicAuthRoute(request)) {
			return null;
		}
		return readAccessTokenCookie(request);
	}

	private static boolean isPublicAuthRoute(HttpServletRequest request) {
		if (!HttpMethod.POST.matches(request.getMethod())) {
			return false;
		}
		String path = request.getRequestURI();
		return "/auth/register".equals(path)
				|| "/auth/login".equals(path)
				|| "/auth/logout".equals(path);
	}

	private static String readAccessTokenCookie(HttpServletRequest request) {
		Cookie[] cookies = request.getCookies();
		if (cookies == null) {
			return null;
		}
		for (Cookie cookie : cookies) {
			if (AccessTokenCookieHelper.COOKIE_NAME.equals(cookie.getName())) {
				String value = cookie.getValue();
				if (value != null && !value.isBlank()) {
					return value;
				}
				return null;
			}
		}
		return null;
	}
}
