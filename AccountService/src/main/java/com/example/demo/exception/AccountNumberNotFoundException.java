package com.example.demo.exception;


public class AccountNumberNotFoundException
        extends RuntimeException {

    public AccountNumberNotFoundException(String message) {
        super(message);
    }
}
