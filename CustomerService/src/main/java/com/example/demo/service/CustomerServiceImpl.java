package com.example.demo.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.example.demo.config.FeignProxy;
import com.example.demo.dto.CustomerRequest;
import com.example.demo.entity.Customer;
import com.example.demo.entity.SavingsDetails;
import com.example.demo.exception.CustomerNotFoundException;
import com.example.demo.exception.DuplicateEmailException;
import com.example.demo.repository.CustomerRepository;

@Service
public class CustomerServiceImpl implements CustomerService {

	private final CustomerRepository customerRepository;
	//private final RestTemplate restTemplate;
	@Autowired
	private FeignProxy feignProxy;
	
	

	public CustomerServiceImpl(
	        CustomerRepository customerRepository,
	        RestTemplate restTemplate) {
	    this.customerRepository = customerRepository;
	    //this.restTemplate = restTemplate;
	}

    @Override
    @Transactional
    public Customer createCustomer(CustomerRequest request) {

        if (customerRepository.existsByEmail(request.email())) {
            throw new DuplicateEmailException(
                "Email already exists: " + request.email()
            );
        }

        Customer customer = new Customer();
        customer.setName(request.name());
        customer.setEmail(request.email());
        customer.setMobile(request.mobile());
        customer.setDateOfBirth(request.dateOfBirth());
        customer.setGender(request.gender());
        customer.setCity(request.city());

        try {
            return customerRepository.saveAndFlush(customer);
        } catch (DataIntegrityViolationException ex) {
            // Also protects against concurrent duplicate-email requests.
            throw new DuplicateEmailException(
                "Email already exists: " + request.email()
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Customer getCustomerById(Long customerId) {
        return customerRepository.findById(customerId)
            .orElseThrow(() ->
                new CustomerNotFoundException(
                    "Customer not found with ID: " + customerId
                )
            );
    }

    @Override
    @Transactional(readOnly = true)
    public Customer getProfile() {
        // Temporary stand-in until authentication is integrated.
        return customerRepository.findFirstByOrderByCustomerIdAsc()
            .orElseThrow(() ->
                new CustomerNotFoundException("No customer found")
            );
    }
    
    @Override
    public SavingsDetails getSavingsSummary(Long customerId) {
        return feignProxy.getSavingsByCustomerId(customerId);
    }

    @Override
    public String getSavingsServicePort() {
        return feignProxy.getSavingsServicePort();
    }
}