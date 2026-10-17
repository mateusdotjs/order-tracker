package com.example.api.orders.dto;

import com.example.api.orders.OrderStatus;

import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(@NotNull OrderStatus status) {
}
