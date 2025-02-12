package org.example.invoicingservice.dto;

import jakarta.persistence.*;
import org.example.invoicingservice.entity.Product;
import org.example.invoicingservice.enums.InvoiceStatus;
import org.example.invoicingservice.enums.InvoiceType;
import org.example.invoicingservice.model.Client;

import java.util.List;

public class StandardInvoice {
    private Long idInvoice;

    private String numberInvoice;

    private String createdAt;

    private Long idClient;

    private InvoiceType invoiceType;

    private Client client;

    private String editor;

    private InvoiceStatus status;

    private boolean expired;

    private String paymentDate;

    private String paymentMethod;

    private int deadline;

    private double ht;

    private float tva;

    private Double ttc;

    private List<Product> products;

    private double travelFees;
}