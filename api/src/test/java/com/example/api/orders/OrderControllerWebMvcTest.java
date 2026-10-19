package com.example.api.orders;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.api.auth.CookieBearerTokenResolver;
import com.example.api.common.GlobalExceptionHandler;
import com.example.api.config.JwtConfig;
import com.example.api.config.SecurityConfig;
import com.example.api.orders.exceptions.OrderNotFoundException;

@WebMvcTest(controllers = OrderController.class)
@Import({
	GlobalExceptionHandler.class,
	SecurityConfig.class,
	JwtConfig.class,
	CookieBearerTokenResolver.class
})
@AutoConfigureMockMvc
class OrderControllerWebMvcTest {

	private static final long OWNER_ID = 1L;

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private OrderService orderService;

	@Test
	void create_returnsValidationFailedWhenItemsEmpty() throws Exception {
		mockMvc.perform(post("/orders")
						.with(jwt().jwt(token -> token.subject(String.valueOf(OWNER_ID))))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "customerName": "Maria",
								  "address": {
								    "street": "Rua A",
								    "number": "100",
								    "city": "São Paulo",
								    "zip": "01000-000"
								  },
								  "items": []
								}
								"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
				.andExpect(jsonPath("$.errors.items").value("REQUIRED"));
	}

	@Test
	void findById_returnsOrderNotFound() throws Exception {
		long orderId = 99L;
		when(orderService.findById(eq(orderId), eq(OWNER_ID)))
				.thenThrow(new OrderNotFoundException(orderId));

		mockMvc.perform(get("/orders/{id}", orderId)
						.with(jwt().jwt(token -> token.subject(String.valueOf(OWNER_ID)))))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.code").value("ORDER_NOT_FOUND"));
	}
}
