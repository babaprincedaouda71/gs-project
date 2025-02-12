package org.example.trainingservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.trainingservice.model.Client;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Training {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTraining;

    private Long idClient;

    @Transient
    private Client client;

    private String theme;
    private int totalNumberOfDays;
    private int totalStaff;

    @ElementCollection
    @CollectionTable(name = "training_dates", joinColumns = @JoinColumn(name = "training_id"))
    @Column(name = "training_date")
    private List<String> trainingDates;

    private double dailyAmount;
    private double amount;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TrainingGroup> groups = new ArrayList<>();

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] trainingSupport;

    private String pv;

    private String completionDate;
}