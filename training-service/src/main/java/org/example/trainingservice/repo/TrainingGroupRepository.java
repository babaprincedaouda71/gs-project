package org.example.trainingservice.repo;

import java.util.Collection;
import java.util.List;
import org.example.trainingservice.entity.TrainingGroup;
import org.example.trainingservice.enums.TrainingGroupStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainingGroupRepository extends JpaRepository<TrainingGroup, Long> {
  List<TrainingGroup> findTrainingGroupsByStatus(TrainingGroupStatus status);

    List<TrainingGroup> findByIdGroupIn(Collection<Long> idGroups);
}