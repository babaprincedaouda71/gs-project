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
public class TrainingGroupDTO {
  private Long idGroup;

  private String label;

  private Long idSupplier;

  private Vendor supplier;

  private String startDate;

  private String endDate;

  private List<String> groupDates;

  private int groupStaff;

  private int numDays;

  private double groupAmount;

  private String location;

  private byte[] trainingSupport;

  private byte[] referenceCertificate;

  private String pv;

  private byte[] presenceList;

  private byte[] evaluation;

  private String completionDate;

  private TrainingGroupStatus status;

  private Long idTraining;

  private Long idClient;

  private Client client; // Si vous voulez inclure les détails du client

  private String theme; // Utile pour le contexte
}