package com.example.api.orders.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateOrderRequest(
		@NotBlank @Size(max = 100) String customerName,
		@NotNull @Valid Address address,
		@NotEmpty @Size(max = 50) @Valid List<Item> items) {

	public record Address(
			@NotBlank @Size(max = 150) String street,
			@NotBlank @Size(max = 20) String number,
			@NotBlank @Size(max = 100) String city,
			@NotBlank @Size(max = 20) String zip) {
	}

	public record Item(
			@NotBlank @Size(max = 100) String name,
			@Min(1) @Max(99) int quantity,
			@NotNull @DecimalMin("0.01") @DecimalMax("99999.99") @Digits(integer = 5, fraction = 2) BigDecimal price) {
	}
}
