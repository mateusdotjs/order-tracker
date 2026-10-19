package com.example.api.orders;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.api.orders.dto.CreateOrderRequest;
import com.example.api.orders.dto.OrderResponse;
import com.example.api.orders.dto.UpdateStatusRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/orders")
public class OrderController {

	private final OrderService orderService;

	public OrderController(OrderService orderService) {
		this.orderService = orderService;
	}

	@PostMapping
	public ResponseEntity<OrderResponse> create(
			@AuthenticationPrincipal Jwt jwt,
			@Valid @RequestBody CreateOrderRequest request) {
		Long ownerId = Long.parseLong(jwt.getSubject());
		OrderResponse response = orderService.create(request, ownerId);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping
	public List<OrderResponse> findAll(@AuthenticationPrincipal Jwt jwt) {
		Long ownerId = Long.parseLong(jwt.getSubject());
		return orderService.findAll(ownerId);
	}

	@GetMapping("/{id}")
	public OrderResponse findById(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
		Long ownerId = Long.parseLong(jwt.getSubject());
		return orderService.findById(id, ownerId);
	}

	@PatchMapping("/{id}/status")
	public OrderResponse updateStatus(
			@AuthenticationPrincipal Jwt jwt,
			@PathVariable Long id,
			@Valid @RequestBody UpdateStatusRequest request) {
		Long ownerId = Long.parseLong(jwt.getSubject());
		return orderService.updateStatus(id, request, ownerId);
	}
}
