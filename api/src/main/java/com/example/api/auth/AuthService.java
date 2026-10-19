package com.example.api.auth;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.api.auth.dto.AuthResponse;
import com.example.api.auth.dto.LoginRequest;
import com.example.api.auth.dto.RegisterRequest;
import com.example.api.auth.exceptions.InvalidCredentialsException;
import com.example.api.users.User;
import com.example.api.users.UserRepository;
import com.example.api.users.exceptions.EmailAlreadyUsedException;
import com.example.api.users.exceptions.UserNotFoundException;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final TokenService tokenService;

	public AuthService(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			TokenService tokenService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.tokenService = tokenService;
	}

	@Transactional
	public AuthResponse register(RegisterRequest request) {
		String email = normalizeEmail(request.email());
		if (userRepository.existsByEmail(email)) {
			throw new EmailAlreadyUsedException();
		}

		String passwordHash = passwordEncoder.encode(request.password());
		User user = userRepository.save(new User(request.name(), email, passwordHash));

		return toAuthResponse(user);
	}

	@Transactional(readOnly = true)
	public LoginSuccess login(LoginRequest request) {
		String email = normalizeEmail(request.email());
		User user = userRepository.findByEmail(email)
				.filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
				.orElseThrow(InvalidCredentialsException::new);

		String token = tokenService.generateToken(user);
		return new LoginSuccess(toAuthResponse(user), token);
	}

	@Transactional(readOnly = true)
	public AuthResponse me(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new UserNotFoundException(userId));
		return toAuthResponse(user);
	}

	private static AuthResponse toAuthResponse(User user) {
		return new AuthResponse(user.getId(), user.getName(), user.getEmail());
	}

	private static String normalizeEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}
}
