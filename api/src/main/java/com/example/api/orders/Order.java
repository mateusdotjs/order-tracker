package com.example.api.orders;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import com.example.api.users.User;

@Entity
@Table(name = "orders")
public class Order {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "owner_id", nullable = false)
	private User owner;

	@Column(nullable = false)
	private String customerName;

	@Embedded
	private Address address;

	@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<OrderItem> items = new ArrayList<>();

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private OrderStatus status;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	protected Order() {
	}

	public Order(String customerName, Address address, User owner) {
		this.customerName = customerName;
		this.address = address;
		this.owner = owner;
	}

	@PrePersist
	void onCreate() {
		if (status == null) {
			status = OrderStatus.RECEBIDO;
		}
		if (createdAt == null) {
			createdAt = Instant.now();
		}
	}

	public Long getId() {
		return id;
	}

	public String getCustomerName() {
		return customerName;
	}

	public Address getAddress() {
		return address;
	}

	public List<OrderItem> getItems() {
		return items;
	}

	public OrderStatus getStatus() {
		return status;
	}

	public void setStatus(OrderStatus status) {
		this.status = status;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public void addItem(OrderItem item) {
		items.add(item);
		item.setOrder(this);
	}
}
