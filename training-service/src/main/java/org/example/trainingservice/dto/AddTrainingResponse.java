package org.example.trainingservice.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.example.trainingservice.entity.TrainingGroup;

@Getter @Setter @ToString
public class AddTrainingResponse {
    private Long idTraining;
    private Long idClient;
    private String theme;
    private List<String> trainingDates;
    private int totalNumberOfDays;
    private int totalStaff;
    private double dailyAmount;
}