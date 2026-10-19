package com.example.api.auth;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.api.auth.dto.AuthResponse;
import com.example.api.common.GlobalExceptionHandler;
import com.example.api.users.exceptions.EmailAlreadyUsedException;

@WebMvcTest(controllers = AuthController.class)
@Import({ GlobalExceptionHandler.class, AccessTokenCookieHelper.class })
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private AuthService authService;

	@Test
	void register_returnsValidationFailedWhenEmailMissing() throws Exception {
		mockMvc.perform(post("/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name":"Alice","email":"","password":"secret1"}
								"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
				.andExpect(jsonPath("$.errors.email").value("REQUIRED"));
	}

	@Test
	void register_returnsEmailAlreadyUsed() throws Exception {
		when(authService.register(any())).thenThrow(new EmailAlreadyUsedException());

		mockMvc.perform(post("/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name":"Alice","email":"alice@example.com","password":"secret1"}
								"""))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.code").value("EMAIL_ALREADY_USED"));
	}

	@Test
	void login_setsAccessTokenCookie() throws Exception {
		AuthResponse user = new AuthResponse(1L, "Alice", "alice@example.com");
		when(authService.login(any())).thenReturn(new LoginSuccess(user, "jwt-token"));

		mockMvc.perform(post("/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"email":"alice@example.com","password":"secret1"}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(1))
				.andExpect(header().string("Set-Cookie", Matchers.containsString("access_token=jwt-token")));
	}

	@Test
	void logout_clearsAccessTokenCookie() throws Exception {
		mockMvc.perform(post("/auth/logout"))
				.andExpect(status().isNoContent())
				.andExpect(header().string("Set-Cookie", Matchers.allOf(
						Matchers.containsString("access_token="),
						Matchers.containsString("Max-Age=0"))));
	}
}
