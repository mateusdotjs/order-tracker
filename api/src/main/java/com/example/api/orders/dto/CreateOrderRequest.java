package com.example.api.orders.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateOrderRequest(
		@NotBlank String customerName,
		@NotNull @Valid Address address,
		@NotEmpty @Valid List<Item> items) {

	public record Address(
			@NotBlank String street,
			@NotBlank String number,
			@NotBlank String city,
			@NotBlank String zip) {
	}

	public record Item(
			@NotBlank String name,
			@Min(1) int quantity,
			@Positive BigDecimal price) {
	}
}
