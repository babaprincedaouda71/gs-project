package org.example.invoicingservice.model;

import lombok.*;
import org.example.invoicingservice.enums.GroupStatus;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Group {
    private Long idGroup;
    private String label;
    private String location;
    private GroupStatus status;
    private int groupStaff;
    private int numDays;
    private String startDate;
    private String endDate;
    private List<String> groupDates;
    private double groupAmount;
    private String completionDate;
    private Long idClient;
    private String client;
    private int clientDeadline;
    private String theme;
}