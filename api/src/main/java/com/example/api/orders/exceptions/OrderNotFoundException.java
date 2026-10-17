package com.example.api.orders.exceptions;

public class OrderNotFoundException extends RuntimeException {

	public OrderNotFoundException(Long id) {
		super("Order not found: " + id);
	}
}
