package org.example.trainingservice;

import java.util.List;
import org.example.trainingservice.entity.Training;
import org.example.trainingservice.entity.TrainingGroup;
import org.example.trainingservice.enums.TrainingGroupStatus;
import org.example.trainingservice.repo.TrainingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableFeignClients
public class TrainingServiceApplication {
  public static void main(String[] args) {
    SpringApplication.run(TrainingServiceApplication.class, args);
  }

  @Bean
  CommandLineRunner commandLineRunner(TrainingRepository trainingRepository) {
    return args -> {
      TrainingGroup trainingGroup =
          TrainingGroup.builder()
              .label("Groupe 1")
              .startDate("2025-01-12")
              .endDate("2025-01-25")
              .idSupplier(1L)
              .groupStaff(5)
              .groupAmount(3000)
              .location("Banfora")
              .status(TrainingGroupStatus.Recherche_formateur)
              .build();

      TrainingGroup trainingGroup2 =
          TrainingGroup.builder()
              .label("Groupe 2")
              .startDate("2025-01-12")
              .endDate("2025-01-25")
              .idSupplier(1L)
              .groupStaff(5)
              .groupAmount(7500)
              .location("Banfora")
              .status(TrainingGroupStatus.Recherche_formateur)
              .build();

      TrainingGroup trainingGroup3 =
          TrainingGroup.builder()
              .label("Groupe 3")
              .startDate("2025-01-12")
              .endDate("2025-01-25")
              .idSupplier(1L)
              .groupStaff(5)
              .groupAmount(5000)
              .location("Banfora")
              .status(TrainingGroupStatus.Recherche_formateur)
              .build();

      TrainingGroup trainingGroup4 =
          TrainingGroup.builder()
              .label("Groupe 4")
              .startDate("2025-01-12")
              .endDate("2025-01-25")
              .idSupplier(1L)
              .groupStaff(5)
              .location("Banfora")
              .status(TrainingGroupStatus.Recherche_formateur)
              .build();

      TrainingGroup trainingGroup5 =
          TrainingGroup.builder()
              .label("Groupe 5")
              .startDate("2025-01-12")
              .endDate("2025-01-25")
              .idSupplier(1L)
              .groupStaff(5)
              .location("Banfora")
              .status(TrainingGroupStatus.Realisation)
              .build();

      TrainingGroup trainingGroup6 =
          TrainingGroup.builder()
              .label("Groupe 6")
              .startDate("2025-01-12")
              .endDate("2025-01-25")
              .idSupplier(1L)
              .groupStaff(5)
              .location("Banfora")
              .status(TrainingGroupStatus.Facturation)
              .build();

      TrainingGroup trainingGroup7 =
          TrainingGroup.builder()
              .label("Groupe 7")
              .startDate("2025-01-12")
              .endDate("2025-01-25")
              .idSupplier(1L)
              .groupStaff(5)
              .location("Banfora")
              .status(TrainingGroupStatus.Impression)
              .build();

      Training training = new Training();
      training.setTheme("test");
      training.setIdClient(1L);
      training.setDailyAmount(4500);
      training.setAmount(22500);
      training.setTotalNumberOfDays(5);
      training.setTotalStaff(5);
      training.setGroups((List.of(trainingGroup, trainingGroup2, trainingGroup3)));
      trainingRepository.save(training);
    };
  }
}