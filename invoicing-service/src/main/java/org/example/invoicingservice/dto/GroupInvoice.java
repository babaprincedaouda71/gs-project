package org.example.invoicingservice.dto;

import jakarta.persistence.*;
import org.example.invoicingservice.enums.InvoiceType;
import org.example.invoicingservice.model.Client;

import java.util.ArrayList;
import java.util.List;

public class GroupInvoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idInvoice;

    private String numberInvoice;

    private String createdAt;

    private Long idClient;

    private Client client;

    private InvoiceType invoiceType;

    private String editor;

    private boolean expired;

    private String paymentDate;

    private String paymentMethod;

    private int deadline;

    private double ht;

    private float tva;

    private Double ttc;

    List<Long> groupsIds = new ArrayList<>();

    private byte[] cheque;

    private double travelFees;

    private byte[] copyRemise;
}