package org.example.trainingservice.service;

import org.example.trainingservice.dto.GroupInvoiceDTO;
import org.example.trainingservice.dto.TrainingGroupDTO;
import org.example.trainingservice.entity.TrainingGroup;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TrainingGroupService {
  List<TrainingGroup> getAllTrainingGroups();

  TrainingGroup updateStatus(Long groupId, TrainingGroup trainingGroup, String status);

  /*Documents de la formation*/
  TrainingGroup addPv(String pv, Long idGroup);

  TrainingGroup removePv(Long idGroup, TrainingGroup trainingGroup);

  TrainingGroup addTrainingSupport(MultipartFile trainingSupport, Long idGroup);

  TrainingGroup removeTrainingSupport(Long idGroup, TrainingGroup trainingGroup);

  TrainingGroup addReferenceCertificate(MultipartFile referenceCertificate, Long idGroup);

  TrainingGroup removeReferenceCertificate(Long idGroup, TrainingGroup trainingGroup);

  TrainingGroup addTrainingNotes(
      MultipartFile presenceList, MultipartFile evaluation, Long idGroup);

  TrainingGroup removeTrainingNotes(Long idGroup, TrainingGroup trainingGroup);

  List<GroupInvoiceDTO> getGroupsToBeInvoiced();

  void markGroupAsInvoiced(TrainingGroup group);

  TrainingGroupDTO getGroupById(Long idGroup);

  ResponseEntity<?> updateGroupStatus(Long groupId, String newStatus);

  List<GroupInvoiceDTO> getGroupsByIds(List<Long> groupIds);

  ResponseEntity<?> updateGroupsStatus(List<Long> groupIds);
}