package org.example.trainingservice.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.example.trainingservice.entity.TrainingGroup;
import org.example.trainingservice.model.Client;

import java.util.List;

@Getter @Setter @ToString
public class AddTrainingRequest {
    private Long idTraining;
    private Long idClient;
    private String theme;
    private List<String> trainingDates;
    private int totalNumberOfDays;
    private int totalStaff;
    private double dailyAmount;
    private double amount;
    private List<TrainingGroup> groups;
    private String completionDate;
}