package com.example.api.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.api.auth.CookieBearerTokenResolver;
import com.example.api.common.ErrorCode;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	private final CookieBearerTokenResolver cookieBearerTokenResolver;

	public SecurityConfig(CookieBearerTokenResolver cookieBearerTokenResolver) {
		this.cookieBearerTokenResolver = cookieBearerTokenResolver;
	}

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				// SameSite=Strict cookie + JSON-only API; no browser form posts to this API.
				.csrf(csrf -> csrf.disable())
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/auth/register", "/auth/login", "/auth/logout", "/h2-console/**")
						.permitAll()
						.anyRequest().authenticated())
				.oauth2ResourceServer(oauth2 -> oauth2
						.bearerTokenResolver(cookieBearerTokenResolver)
						.jwt(Customizer.withDefaults()))
				.exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authException) -> {
					ErrorCode code = ErrorCode.UNAUTHENTICATED;
					response.setStatus(code.getStatus().value());
					response.setContentType(MediaType.APPLICATION_JSON_VALUE);
					response.getWriter().write(unauthenticatedJson(code));
				}));

		return http.build();
	}

	private static String unauthenticatedJson(ErrorCode code) {
		return "{\"code\":\"" + code.name() + "\",\"message\":\"" + code.getMessage() + "\"}";
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(List.of("http://localhost:5173"));
		configuration.setAllowedMethods(List.of("GET", "POST", "PATCH", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("Content-Type"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
