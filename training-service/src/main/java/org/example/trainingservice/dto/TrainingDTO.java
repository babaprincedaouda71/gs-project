package org.example.trainingservice.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.example.trainingservice.entity.TrainingGroup;
import org.example.trainingservice.model.Client;

@Getter
@Setter
@ToString
public class TrainingDTO {
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