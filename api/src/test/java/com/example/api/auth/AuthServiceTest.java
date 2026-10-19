package com.example.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.api.auth.dto.AuthResponse;
import com.example.api.auth.dto.LoginRequest;
import com.example.api.auth.dto.RegisterRequest;
import com.example.api.auth.exceptions.InvalidCredentialsException;
import com.example.api.users.User;
import com.example.api.users.UserRepository;
import com.example.api.users.exceptions.EmailAlreadyUsedException;
import com.example.api.users.exceptions.UserNotFoundException;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

	private static final String RAW_PASSWORD = "secret1";
	private static final String PASSWORD_HASH = "hashed-secret";

	@Mock
	private UserRepository userRepository;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private TokenService tokenService;

	@InjectMocks
	private AuthService authService;

	@Test
	void register_savesUserAndReturnsAuthResponse() {
		RegisterRequest request = new RegisterRequest("Alice", "alice@example.com", RAW_PASSWORD);
		when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
		when(passwordEncoder.encode(RAW_PASSWORD)).thenReturn(PASSWORD_HASH);
		when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
			User user = invocation.getArgument(0);
			ReflectionTestUtils.setField(user, "id", 1L);
			return user;
		});

		AuthResponse response = authService.register(request);

		assertThat(response.id()).isEqualTo(1L);
		assertThat(response.name()).isEqualTo("Alice");
		assertThat(response.email()).isEqualTo("alice@example.com");
		verify(passwordEncoder).encode(RAW_PASSWORD);
		ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
		verify(userRepository).save(userCaptor.capture());
		assertThat(userCaptor.getValue().getEmail()).isEqualTo("alice@example.com");
		assertThat(userCaptor.getValue().getPasswordHash()).isEqualTo(PASSWORD_HASH);
	}

	@Test
	void register_throwsWhenEmailAlreadyUsed() {
		RegisterRequest request = new RegisterRequest("Alice", "alice@example.com", RAW_PASSWORD);
		when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

		assertThatThrownBy(() -> authService.register(request))
				.isInstanceOf(EmailAlreadyUsedException.class);

		verify(userRepository, never()).save(any(User.class));
		verify(passwordEncoder, never()).encode(any());
	}

	@Test
	void register_normalizesEmail() {
		RegisterRequest request = new RegisterRequest("Alice", "  Alice@Example.COM  ", RAW_PASSWORD);
		when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
		when(passwordEncoder.encode(RAW_PASSWORD)).thenReturn(PASSWORD_HASH);
		when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
			User user = invocation.getArgument(0);
			ReflectionTestUtils.setField(user, "id", 2L);
			return user;
		});

		authService.register(request);

		verify(userRepository).existsByEmail("alice@example.com");
		ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
		verify(userRepository).save(userCaptor.capture());
		assertThat(userCaptor.getValue().getEmail()).isEqualTo("alice@example.com");
	}

	@Test
	void login_returnsLoginSuccessWithToken() {
		LoginRequest request = new LoginRequest("alice@example.com", RAW_PASSWORD);
		User user = userWithId(1L, "Alice", "alice@example.com");
		when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
		when(passwordEncoder.matches(RAW_PASSWORD, PASSWORD_HASH)).thenReturn(true);
		when(tokenService.generateToken(user)).thenReturn("jwt-token");

		LoginSuccess result = authService.login(request);

		assertThat(result.user().id()).isEqualTo(1L);
		assertThat(result.user().email()).isEqualTo("alice@example.com");
		assertThat(result.accessToken()).isEqualTo("jwt-token");
		verify(tokenService).generateToken(user);
	}

	@Test
	void login_throwsWhenUserNotFound() {
		LoginRequest request = new LoginRequest("missing@example.com", RAW_PASSWORD);
		when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

		assertThatThrownBy(() -> authService.login(request))
				.isInstanceOf(InvalidCredentialsException.class);

		verify(tokenService, never()).generateToken(any());
	}

	@Test
	void login_throwsWhenPasswordDoesNotMatch() {
		LoginRequest request = new LoginRequest("alice@example.com", "wrong");
		User user = userWithId(1L, "Alice", "alice@example.com");
		when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
		when(passwordEncoder.matches("wrong", PASSWORD_HASH)).thenReturn(false);

		assertThatThrownBy(() -> authService.login(request))
				.isInstanceOf(InvalidCredentialsException.class);

		verify(tokenService, never()).generateToken(any());
	}

	@Test
	void login_normalizesEmail() {
		LoginRequest request = new LoginRequest("  Alice@Example.COM  ", RAW_PASSWORD);
		User user = userWithId(1L, "Alice", "alice@example.com");
		when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
		when(passwordEncoder.matches(RAW_PASSWORD, PASSWORD_HASH)).thenReturn(true);
		when(tokenService.generateToken(user)).thenReturn("jwt-token");

		authService.login(request);

		verify(userRepository).findByEmail("alice@example.com");
	}

	@Test
	void me_returnsAuthResponse() {
		User user = userWithId(5L, "Bob", "bob@example.com");
		when(userRepository.findById(5L)).thenReturn(Optional.of(user));

		AuthResponse response = authService.me(5L);

		assertThat(response.id()).isEqualTo(5L);
		assertThat(response.name()).isEqualTo("Bob");
		assertThat(response.email()).isEqualTo("bob@example.com");
	}

	@Test
	void me_throwsWhenUserNotFound() {
		when(userRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> authService.me(99L))
				.isInstanceOf(UserNotFoundException.class);
	}

	private static User userWithId(long id, String name, String email) {
		User user = new User(name, email, PASSWORD_HASH);
		ReflectionTestUtils.setField(user, "id", id);
		return user;
	}
}
