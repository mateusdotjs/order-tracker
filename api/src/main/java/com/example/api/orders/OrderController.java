package com.example.api.orders;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
	public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
		OrderResponse response = orderService.create(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping
	public List<OrderResponse> findAll() {
		return orderService.findAll();
	}

	@GetMapping("/{id}")
	public OrderResponse findById(@PathVariable Long id) {
		return orderService.findById(id);
	}

	@PatchMapping("/{id}/status")
	public OrderResponse updateStatus(
			@PathVariable Long id,
			@Valid @RequestBody UpdateStatusRequest request) {
		return orderService.updateStatus(id, request);
	}
}
