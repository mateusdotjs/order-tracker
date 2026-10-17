package com.example.api.orders;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.api.orders.dto.CreateOrderRequest;
import com.example.api.orders.dto.OrderResponse;
import com.example.api.orders.dto.UpdateStatusRequest;
import com.example.api.orders.exceptions.OrderNotFoundException;

@Service
public class OrderService {

	private final OrderRepository orderRepository;

	public OrderService(OrderRepository orderRepository) {
		this.orderRepository = orderRepository;
	}

	@Transactional
	public OrderResponse create(CreateOrderRequest request) {
		Address address = new Address(
				request.address().street(),
				request.address().number(),
				request.address().city(),
				request.address().zip());

		Order order = new Order(request.customerName(), address);
		for (CreateOrderRequest.Item item : request.items()) {
			order.addItem(new OrderItem(item.name(), item.quantity(), item.price()));
		}

		return toResponse(orderRepository.save(order));
	}

	@Transactional(readOnly = true)
	public List<OrderResponse> findAll() {
		return orderRepository.findAll().stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public OrderResponse findById(Long id) {
		return toResponse(getOrderOrThrow(id));
	}

	@Transactional
	public OrderResponse updateStatus(Long id, UpdateStatusRequest request) {
		Order order = getOrderOrThrow(id);
		order.setStatus(request.status());
		return toResponse(orderRepository.save(order));
	}

	private Order getOrderOrThrow(Long id) {
		return orderRepository.findById(id)
				.orElseThrow(() -> new OrderNotFoundException(id));
	}

	private OrderResponse toResponse(Order order) {
		Address address = order.getAddress();
		OrderResponse.Address addressDto = new OrderResponse.Address(
				address.getStreet(),
				address.getNumber(),
				address.getCity(),
				address.getZip());

		List<OrderResponse.Item> items = order.getItems().stream()
				.map(item -> new OrderResponse.Item(item.getName(), item.getQuantity(), item.getPrice()))
				.toList();

		return new OrderResponse(
				order.getId(),
				order.getCustomerName(),
				addressDto,
				items,
				order.getStatus(),
				order.getCreatedAt());
	}
}
