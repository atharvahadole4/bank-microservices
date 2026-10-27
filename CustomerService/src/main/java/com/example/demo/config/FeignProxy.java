
package com.example.demo.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.example.demo.entity.SavingsDetails;

@FeignClient(name="AccountService")
public interface FeignProxy {

    @GetMapping("/api/v1/customers/{customerid}")
    SavingsDetails getSavingsByCustomerId(
            @PathVariable("customerid") Long customerId);

    @GetMapping("/api/v1/savings/port")
    String getSavingsServicePort();
}
