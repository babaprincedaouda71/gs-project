package org.example.trainingservice.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.trainingservice.entity.TrainingGroup;
import org.example.trainingservice.model.Client;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TrainingRequest {
  private Long idTraining;
  private Long idClient;
  private Client client;
  private String theme;
  private int totalNumberOfDays;
  private int totalStaff;
  private List<String> trainingDates;
  private double amount;
  private double dailyAmount;
  private List<TrainingGroup> groups;
  private byte[] trainingSupport;
  private String pv;
  private String completionDate;
}