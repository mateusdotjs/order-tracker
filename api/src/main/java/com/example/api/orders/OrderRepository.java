package com.example.api.orders;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

	@EntityGraph(attributePaths = "items")
	List<Order> findAllByOwnerId(Long ownerId);

	@EntityGraph(attributePaths = "items")
	Optional<Order> findByIdAndOwnerId(Long id, Long ownerId);
}
