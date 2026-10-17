package com.example.api.orders;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class Address {

	@Column(nullable = false)
	private String street;

	@Column(nullable = false)
	private String number;

	@Column(nullable = false)
	private String city;

	@Column(nullable = false)
	private String zip;

	protected Address() {
	}

	public Address(String street, String number, String city, String zip) {
		this.street = street;
		this.number = number;
		this.city = city;
		this.zip = zip;
	}

	public String getStreet() {
		return street;
	}

	public String getNumber() {
		return number;
	}

	public String getCity() {
		return city;
	}

	public String getZip() {
		return zip;
	}
}
