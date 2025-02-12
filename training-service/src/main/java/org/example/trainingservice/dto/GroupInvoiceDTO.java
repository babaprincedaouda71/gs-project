package org.example.trainingservice.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.trainingservice.enums.TrainingGroupStatus;
import org.example.trainingservice.model.Client;
import org.example.trainingservice.model.Vendor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GroupInvoiceDTO {
  private Long idGroup;

  private String label;

  private String startDate;

  private String endDate;

  private List<String> groupDates;

  private int groupStaff;

  private int numDays;

  private double groupAmount;

  private String location;

  private String completionDate;

  private TrainingGroupStatus status;

  private Long idClient;

  private String client;

  private int clientDeadline;

  private String theme;
}