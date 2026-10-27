package com.example.demo.exception;

import jakarta.validation.ConstraintViolationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private Map<String, Object> errorBody(
            int status, String error, Object message) {

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", status);
        body.put("error", error);
        body.put("message", message);
        return body;
    }

    @ExceptionHandler(AccountNumberNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(
            AccountNumberNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(errorBody(
                404, "Not Found", ex.getMessage()
            ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new LinkedHashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.putIfAbsent(
                error.getField(),
                error.getDefaultMessage()
            )
        );

        return ResponseEntity.badRequest()
            .body(errorBody(400, "Validation Failed", errors));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidRequest(
            HttpMessageNotReadableException ex) {

        return ResponseEntity.badRequest()
            .body(errorBody(
                400, "Bad Request",
                "Invalid JSON, date, or data type"
            ));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(
            ConstraintViolationException ex) {

        return ResponseEntity.badRequest()
            .body(errorBody(
                400, "Validation Failed",
                "One or more values are invalid"
            ));
    }
}