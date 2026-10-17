package com.example.api.users.exceptions;

public class EmailAlreadyUsedException extends RuntimeException {

	public EmailAlreadyUsedException() {
		super("Email already in use");
	}
}
