package org.example.trainingservice.repo;

import java.util.List;
import java.util.Optional;
import org.example.trainingservice.entity.Training;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainingRepository extends JpaRepository<Training, Long> {
  @Override
  void delete(Training training);

  // Méthode pour récupérer les formations avec le statut "Facturation"
  @Query("SELECT t FROM Training t WHERE t.idClient = :idClient")
  List<Training> findByIdClient(Long idClient);

  @Query("SELECT DISTINCT t FROM Training t JOIN FETCH t.groups g WHERE g.idGroup IN :groupIds")
  List<Training> findTrainingsByGroupIds(@Param("groupIds") List<Long> groupIds);

  // Ajoutons aussi une méthode pour récupérer le Training associé
  @Query("SELECT t FROM Training t " + "JOIN t.groups tg " + "WHERE tg.idGroup = :groupId")
  Optional<Training> findTrainingByGroupId(@Param("groupId") Long groupId);
}