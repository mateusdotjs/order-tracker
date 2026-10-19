package com.example.api.auth;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.api.auth.dto.AuthResponse;
import com.example.api.auth.dto.LoginRequest;
import com.example.api.auth.dto.RegisterRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

	private final AuthService authService;
	private final AccessTokenCookieHelper accessTokenCookieHelper;

	public AuthController(AuthService authService, AccessTokenCookieHelper accessTokenCookieHelper) {
		this.authService = authService;
		this.accessTokenCookieHelper = accessTokenCookieHelper;
	}

	@PostMapping("/register")
	public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
		AuthResponse response = authService.register(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
		LoginSuccess success = authService.login(request);
		return ResponseEntity.ok()
				.header(HttpHeaders.SET_COOKIE, accessTokenCookieHelper.buildSetCookie(success.accessToken()).toString())
				.body(success.user());
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout() {
		return ResponseEntity.noContent()
				.header(HttpHeaders.SET_COOKIE, accessTokenCookieHelper.buildClearCookie().toString())
				.build();
	}

	@GetMapping("/me")
	public AuthResponse me(@AuthenticationPrincipal Jwt jwt) {
		return authService.me(Long.parseLong(jwt.getSubject()));
	}
}
