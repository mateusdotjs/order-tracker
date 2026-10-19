package com.example.api.orders;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.api.orders.dto.CreateOrderRequest;
import com.example.api.orders.dto.OrderResponse;
import com.example.api.orders.dto.UpdateStatusRequest;
import com.example.api.orders.exceptions.OrderNotFoundException;
import com.example.api.users.User;
import com.example.api.users.UserRepository;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

	private static final Long OWNER_ID = 1L;

	@Mock
	private OrderRepository orderRepository;

	@Mock
	private UserRepository userRepository;

	@InjectMocks
	private OrderService orderService;

	private User owner;

	@BeforeEach
	void setUp() {
		owner = new User("Owner", "owner@example.com", "hash");
		ReflectionTestUtils.setField(owner, "id", OWNER_ID);
	}

	@Test
	void create_persistsOrderAndReturnsResponse() {
		CreateOrderRequest request = sampleCreateOrderRequest();
		when(userRepository.getReferenceById(OWNER_ID)).thenReturn(owner);
		when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
			Order order = invocation.getArgument(0);
			order.onCreate();
			ReflectionTestUtils.setField(order, "id", 10L);
			return order;
		});

		OrderResponse response = orderService.create(request, OWNER_ID);

		assertThat(response.id()).isEqualTo(10L);
		assertThat(response.customerName()).isEqualTo("Maria");
		assertThat(response.status()).isEqualTo(OrderStatus.RECEBIDO);
		assertThat(response.address().street()).isEqualTo("Rua A");
		assertThat(response.items()).hasSize(1);
		assertThat(response.items().get(0).name()).isEqualTo("Pizza");
		assertThat(response.items().get(0).quantity()).isEqualTo(2);
		assertThat(response.items().get(0).price()).isEqualByComparingTo("29.90");
		assertThat(response.createdAt()).isNotNull();

		ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
		verify(orderRepository).save(orderCaptor.capture());
		Order saved = orderCaptor.getValue();
		assertThat(saved.getCustomerName()).isEqualTo("Maria");
		assertThat(saved.getItems()).hasSize(1);
	}

	@Test
	void findAll_mapsOrdersToResponses() {
		Order order = persistedOrder(10L, OrderStatus.RECEBIDO);
		when(orderRepository.findAllByOwnerId(OWNER_ID)).thenReturn(List.of(order));

		List<OrderResponse> responses = orderService.findAll(OWNER_ID);

		assertThat(responses).hasSize(1);
		assertThat(responses.get(0).id()).isEqualTo(10L);
		assertThat(responses.get(0).customerName()).isEqualTo("Maria");
	}

	@Test
	void findAll_returnsEmptyList() {
		when(orderRepository.findAllByOwnerId(OWNER_ID)).thenReturn(List.of());

		List<OrderResponse> responses = orderService.findAll(OWNER_ID);

		assertThat(responses).isEmpty();
	}

	@Test
	void findById_returnsOrderForOwner() {
		Order order = persistedOrder(10L, OrderStatus.EM_PREPARO);
		when(orderRepository.findByIdAndOwnerId(10L, OWNER_ID)).thenReturn(Optional.of(order));

		OrderResponse response = orderService.findById(10L, OWNER_ID);

		assertThat(response.id()).isEqualTo(10L);
		assertThat(response.status()).isEqualTo(OrderStatus.EM_PREPARO);
	}

	@Test
	void findById_throwsWhenNotFoundOrWrongOwner() {
		when(orderRepository.findByIdAndOwnerId(99L, OWNER_ID)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> orderService.findById(99L, OWNER_ID))
				.isInstanceOf(OrderNotFoundException.class);
	}

	@Test
	void updateStatus_updatesAndReturnsOrder() {
		Order order = persistedOrder(10L, OrderStatus.RECEBIDO);
		when(orderRepository.findByIdAndOwnerId(10L, OWNER_ID)).thenReturn(Optional.of(order));
		when(orderRepository.save(order)).thenReturn(order);

		OrderResponse response = orderService.updateStatus(
				10L, new UpdateStatusRequest(OrderStatus.SAIU_PARA_ENTREGA), OWNER_ID);

		assertThat(response.status()).isEqualTo(OrderStatus.SAIU_PARA_ENTREGA);
		assertThat(order.getStatus()).isEqualTo(OrderStatus.SAIU_PARA_ENTREGA);
		verify(orderRepository).save(order);
	}

	@Test
	void updateStatus_throwsWhenOrderNotFound() {
		when(orderRepository.findByIdAndOwnerId(99L, OWNER_ID)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> orderService.updateStatus(
				99L, new UpdateStatusRequest(OrderStatus.ENTREGUE), OWNER_ID))
				.isInstanceOf(OrderNotFoundException.class);
	}

	private static CreateOrderRequest sampleCreateOrderRequest() {
		return new CreateOrderRequest(
				"Maria",
				new CreateOrderRequest.Address("Rua A", "100", "São Paulo", "01000-000"),
				List.of(new CreateOrderRequest.Item("Pizza", 2, new BigDecimal("29.90"))));
	}

	private Order persistedOrder(long id, OrderStatus status) {
		Address address = new Address("Rua A", "100", "São Paulo", "01000-000");
		Order order = new Order("Maria", address, owner);
		order.addItem(new OrderItem("Pizza", 2, new BigDecimal("29.90")));
		order.onCreate();
		order.setStatus(status);
		ReflectionTestUtils.setField(order, "id", id);
		return order;
	}
}
