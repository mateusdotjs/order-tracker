package com.example.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.api.users.User;

@ExtendWith(MockitoExtension.class)
class TokenServiceTest {

	private static final long EXPIRATION_MINUTES = 15L;

	@Mock
	private JwtEncoder jwtEncoder;

	@Mock
	private Jwt jwt;

	private TokenService tokenService;

	@BeforeEach
	void setUp() {
		tokenService = new TokenService(jwtEncoder, EXPIRATION_MINUTES);
	}

	@Test
	void generateToken_encodesClaimsAndReturnsTokenValue() {
		User user = new User("Alice", "alice@example.com", "hash");
		ReflectionTestUtils.setField(user, "id", 42L);
		when(jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(jwt);
		when(jwt.getTokenValue()).thenReturn("jwt-token");

		String token = tokenService.generateToken(user);

		assertThat(token).isEqualTo("jwt-token");

		ArgumentCaptor<JwtEncoderParameters> parametersCaptor =
				ArgumentCaptor.forClass(JwtEncoderParameters.class);
		verify(jwtEncoder).encode(parametersCaptor.capture());
		JwtClaimsSet claims = parametersCaptor.getValue().getClaims();
		assertThat(claims.getClaimAsString("iss")).isEqualTo("api");
		assertThat(claims.getSubject()).isEqualTo("42");
		assertThat(claims.getClaimAsString("email")).isEqualTo("alice@example.com");
		assertThat(claims.getIssuedAt()).isNotNull();
		assertThat(claims.getExpiresAt()).isNotNull();
		assertThat(claims.getExpiresAt()).isAfter(claims.getIssuedAt());
	}
}
