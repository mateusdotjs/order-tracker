package com.example.api.orders.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.example.api.orders.OrderStatus;

public record OrderResponse(
		Long id,
		String customerName,
		Address address,
		List<Item> items,
		OrderStatus status,
		Instant createdAt) {

	public record Address(String street, String number, String city, String zip) {
	}

	public record Item(String name, int quantity, BigDecimal price) {
	}
}
