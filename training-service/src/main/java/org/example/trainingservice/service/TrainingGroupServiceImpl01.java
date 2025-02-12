package org.example.trainingservice.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.example.trainingservice.clients.ClientRest;
import org.example.trainingservice.clients.VendorRest;
import org.example.trainingservice.dto.GroupInvoiceDTO;
import org.example.trainingservice.dto.TrainingGroupDTO;
import org.example.trainingservice.entity.Training;
import org.example.trainingservice.entity.TrainingGroup;
import org.example.trainingservice.enums.TrainingGroupStatus;
import org.example.trainingservice.exceptions.TrainingGroupNotFoundException;
import org.example.trainingservice.exceptions.TrainingNotFoundException;
import org.example.trainingservice.mapper.GroupMapper;
import org.example.trainingservice.model.Client;
import org.example.trainingservice.model.Vendor;
import org.example.trainingservice.repo.TrainingGroupRepository;
import org.example.trainingservice.repo.TrainingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class TrainingGroupServiceImpl01 implements TrainingGroupService {
  private final TrainingRepository trainingRepository;
  private final TrainingGroupRepository trainingGroupRepository;
  private final ClientRest clientRest;
  private final VendorRest vendorRest;
  private final GroupMapper groupMapper;
  private int staff;

  public TrainingGroupServiceImpl01(
      TrainingRepository trainingRepository,
      TrainingGroupRepository trainingGroupRepository,
      ClientRest clientRest,
      VendorRest vendorRest,
      GroupMapper groupMapper) {
    this.trainingRepository = trainingRepository;
    this.trainingGroupRepository = trainingGroupRepository;
    this.clientRest = clientRest;
    this.vendorRest = vendorRest;
    this.groupMapper = groupMapper;
  }

  @Override
  public List<TrainingGroup> getAllTrainingGroups() {
    return trainingGroupRepository.findAll();
  }

  @Override
  public TrainingGroup updateStatus(Long groupId, TrainingGroup trainingGroup, String status) {
    return null;
  }

  /*Documents de la formation*/
  @Override
  public TrainingGroup addPv(String pv, Long idGroup) {
    TrainingGroup group =
        trainingGroupRepository
            .findById(idGroup)
            .orElseThrow(() -> new TrainingGroupNotFoundException("Training group not found"));

    Training training =
        trainingRepository
            .findTrainingByGroupId(idGroup)
            .orElseThrow(() -> new TrainingNotFoundException("Training associé non trouvé"));

    training.setPv(pv);
    trainingRepository.save(training);
    return group;
  }

  @Override
  public TrainingGroup removePv(Long idGroup, TrainingGroup trainingGroup) {
    return null;
  }

  @Override
  public TrainingGroup addTrainingSupport(MultipartFile trainingSupport, Long idGroup) {
    TrainingGroup group =
        trainingGroupRepository
            .findById(idGroup)
            .orElseThrow(() -> new TrainingGroupNotFoundException("Training group not found"));

    Training training =
        trainingRepository
            .findTrainingByGroupId(idGroup)
            .orElseThrow(() -> new TrainingNotFoundException("Training associé non trouvé"));
    try {
      training.setTrainingSupport(trainingSupport.getBytes());
      trainingRepository.save(training);
      return group;
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public TrainingGroup removeTrainingSupport(Long idGroup, TrainingGroup trainingGroup) {
    return null;
  }

  @Override
  public TrainingGroup addReferenceCertificate(MultipartFile referenceCertificate, Long idGroup) {
    TrainingGroup group =
        trainingGroupRepository
            .findById(idGroup)
            .orElseThrow(() -> new TrainingGroupNotFoundException("Training group not found"));

    try {
      group.setReferenceCertificate(referenceCertificate.getBytes());
      return group;
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public TrainingGroup removeReferenceCertificate(Long idGroup, TrainingGroup trainingGroup) {
    return null;
  }

  @Override
  public TrainingGroup addTrainingNotes(
      MultipartFile presenceList, MultipartFile evaluation, Long idGroup) {
    TrainingGroup group =
        trainingGroupRepository
            .findById(idGroup)
            .orElseThrow(() -> new TrainingGroupNotFoundException("Training group not found"));
    try {
      group.setPresenceList(presenceList.getBytes());
      group.setEvaluation(evaluation.getBytes());
      return group;
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public TrainingGroup removeTrainingNotes(Long idGroup, TrainingGroup trainingGroup) {
    return null;
  }

  @Override
  public void markGroupAsInvoiced(TrainingGroup group) {
    trainingGroupRepository.save(group);
  }

  /*********************************************/
  @Override
  public List<GroupInvoiceDTO> getGroupsToBeInvoiced() {
    List<TrainingGroup> groupsByStatus =
        trainingGroupRepository.findTrainingGroupsByStatus(TrainingGroupStatus.Attestation);
    return mapToGroupInvoiceDTO(groupsByStatus);
  }

  List<GroupInvoiceDTO> mapToGroupInvoiceDTO(List<TrainingGroup> trainingGroups) {
    List<GroupInvoiceDTO> groupInvoiceDTOs = new ArrayList<>();
    trainingGroups.forEach(
        trainingGroup -> {
          Training training =
              trainingRepository
                  .findTrainingByGroupId(trainingGroup.getIdGroup())
                  .orElseThrow(() -> new TrainingNotFoundException("Training not found"));
          Client client = clientRest.findClientById(training.getIdClient());
          GroupInvoiceDTO groupInvoiceDTO = new GroupInvoiceDTO();
          groupInvoiceDTO.setIdGroup(trainingGroup.getIdGroup());
          groupInvoiceDTO.setStartDate(trainingGroup.getStartDate());
          groupInvoiceDTO.setEndDate(trainingGroup.getEndDate());
          groupInvoiceDTO.setStatus(trainingGroup.getStatus());
          groupInvoiceDTO.setGroupDates(trainingGroup.getGroupDates());
          groupInvoiceDTO.setGroupStaff(trainingGroup.getGroupStaff());
          groupInvoiceDTO.setNumDays(trainingGroup.getNumberOfDays());
          groupInvoiceDTO.setGroupAmount(trainingGroup.getGroupAmount());
          groupInvoiceDTO.setLocation(trainingGroup.getLocation());
          groupInvoiceDTO.setCompletionDate(trainingGroup.getCompletionDate());
          groupInvoiceDTO.setIdClient(client.getIdClient());
          groupInvoiceDTO.setClient(client.getCorporateName());
          groupInvoiceDTO.setTheme(training.getTheme());
          groupInvoiceDTOs.add(groupInvoiceDTO);
        });
    return groupInvoiceDTOs;
  }

  /*********************************************/

  @Override
  public TrainingGroupDTO getGroupById(Long idGroup) {
    TrainingGroup group =
        trainingGroupRepository
            .findById(idGroup)
            .orElseThrow(() -> new TrainingGroupNotFoundException("Group non trouvé"));

    // Récupérer le Training associé
    Training training =
        trainingRepository
            .findTrainingByGroupId(idGroup)
            .orElseThrow(() -> new TrainingNotFoundException("Training associé non trouvé"));

    // Enrichir avec les données du client si nécessaire
    if (training.getIdClient() != null) {
      Client client = clientRest.findClientById(training.getIdClient());
      training.setClient(client);
    }

    // Enrichir avec les données du formateur
    Vendor vendor = vendorRest.findVendorById(group.getIdSupplier());
    group.setIdSupplier(vendor.getIdSupplier());
    group.setSupplier(vendor);
    group.setIdTraining(training.getIdTraining());

    TrainingGroupDTO trainingGroupDTO = groupMapper.fromTrainingGroup(group);
    trainingGroupDTO.setIdClient(training.getIdClient());
    trainingGroupDTO.setClient(training.getClient());
    trainingGroupDTO.setTheme(training.getTheme());
    trainingGroupDTO.setTrainingSupport(training.getTrainingSupport());
    trainingGroupDTO.setPv(training.getPv());
    return trainingGroupDTO;
  }

  @Override
  public ResponseEntity updateGroupStatus(Long groupId, String newStatus) {
    TrainingGroup group =
        trainingGroupRepository
            .findById(groupId)
            .orElseThrow(() -> new TrainingGroupNotFoundException("Groupe non trouvé"));
    //    int currentIndex = Arrays.asList(TrainingGroupStatus.values()).indexOf(group.getStatus());
    //    int newIndex =
    //
    // Arrays.asList(TrainingGroupStatus.values()).indexOf(TrainingGroupStatus.valueOf(newStatus));
    //
    //    if (newIndex != currentIndex + 1) {
    //      return ResponseEntity.badRequest().body("Transition d'état invalid");
    //    }

    group.setStatus(TrainingGroupStatus.valueOf(newStatus));
    trainingGroupRepository.save(group);
    return ResponseEntity.ok().build();
  }

  @Override
  public ResponseEntity updateGroupsStatus(List<Long> groupIds) {
    List<TrainingGroup> groups = trainingGroupRepository.findByIdGroupIn(groupIds);
    groups.forEach(
        trainingGroup -> {
          if (trainingGroup.getStatus() == TrainingGroupStatus.Attestation) {
            trainingGroup.setStatus(TrainingGroupStatus.Facturation);
          }
          if (trainingGroup.getStatus() == TrainingGroupStatus.Facturation) {
            trainingGroup.setStatus(TrainingGroupStatus.Reglement);
          }
        });
    trainingGroupRepository.saveAll(groups);

    return ResponseEntity.ok().build();
  }

  @Override
  public List<GroupInvoiceDTO> getGroupsByIds(List<Long> groupIds) {
    List<TrainingGroup> byIdGroupIn = trainingGroupRepository.findByIdGroupIn(groupIds);
    return mapToGroupInvoiceDTO(byIdGroupIn);
  }
}