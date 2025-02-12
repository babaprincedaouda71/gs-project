package org.example.trainingservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.trainingservice.enums.TrainingGroupStatus;
import org.example.trainingservice.model.Vendor;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class TrainingGroup {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idGroup;

  private String label;

  private String startDate;
  private String endDate;

  private Long idSupplier;

  @Transient private Vendor supplier;

  @ElementCollection
  @CollectionTable(name = "group_dates", joinColumns = @JoinColumn(name = "groupe_id"))
  @Column(name = "group_date")
  @SuppressWarnings("JpaAttributeTypeInspection")
  private List<String> groupDates;

  private int groupStaff;
  private String location;

  private int numberOfDays;

  private double groupAmount;


  @Lob
  @Column(columnDefinition = "LONGBLOB")
  private byte[] referenceCertificate;

  @Lob
  @Column(columnDefinition = "LONGBLOB")
  private byte[] presenceList;

  @Lob
  @Column(columnDefinition = "LONGBLOB")
  private byte[] evaluation;

  private String completionDate;

  private Long idTraining;

  @Enumerated(EnumType.STRING)
  private TrainingGroupStatus status;
}