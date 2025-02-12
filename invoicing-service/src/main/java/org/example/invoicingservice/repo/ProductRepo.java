package org.example.invoicingservice.repo;

import org.example.invoicingservice.entity.Invoice;
import org.example.invoicingservice.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepo extends JpaRepository<Product, Long> {

    void deleteByInvoice(Invoice invoice);
}