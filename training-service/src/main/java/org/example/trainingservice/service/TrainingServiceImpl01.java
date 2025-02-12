package org.example.trainingservice.service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.example.trainingservice.clients.ClientRest;
import org.example.trainingservice.clients.VendorRest;
import org.example.trainingservice.dto.*;
import org.example.trainingservice.entity.Training;
import org.example.trainingservice.entity.TrainingGroup;
import org.example.trainingservice.enums.TrainingGroupStatus;
import org.example.trainingservice.exceptions.TrainingNotFoundException;
import org.example.trainingservice.mapper.GroupMapper;
import org.example.trainingservice.mapper.TrainingMapper;
import org.example.trainingservice.model.Client;
import org.example.trainingservice.model.Vendor;
import org.example.trainingservice.repo.TrainingGroupRepository;
import org.example.trainingservice.repo.TrainingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Transactional
@Service
@Slf4j
public class TrainingServiceImpl01 implements TrainingService {
  private final TrainingRepository trainingRepository;
  private final TrainingGroupRepository trainingGroupRepository;
  private final TrainingMapper trainingMapper;
  private final ClientRest clientRest;
  private final VendorRest vendorRest;
  private final GroupMapper groupMapper;
  private final TrainingGroupService trainingGroupService;

  public TrainingServiceImpl01(
      TrainingRepository trainingRepository,
      TrainingGroupRepository trainingGroupRepository,
      TrainingMapper trainingMapper,
      ClientRest clientRest,
      VendorRest vendorRest,
      GroupMapper groupMapper,
      TrainingGroupService trainingGroupService) {
    this.trainingRepository = trainingRepository;
    this.trainingGroupRepository = trainingGroupRepository;
    this.trainingMapper = trainingMapper;
    this.clientRest = clientRest;
    this.vendorRest = vendorRest;
    this.groupMapper = groupMapper;
    this.trainingGroupService = trainingGroupService;
  }

  @Override
  public List<TrainingResponse> getTrainings() {
    List<Training> trainings = trainingRepository.findAll();
    enrichTrainingsWithClientsAndVendors(trainings);
    return trainings.stream()
        .map(trainingMapper::fromTrainingToTrainingResponse)
        .collect(Collectors.toList());
  }

  /***************** Start Add Training *******************************/
  @Override
  public AddTrainingResponse addTraining(AddTrainingRequest addTrainingRequest) {
    Training training = trainingMapper.fromAddTrainingRequestToTraining(addTrainingRequest);

    initializeTrainingGroupsStatus(training);

    Training savedTraining = trainingRepository.save(training);

    return trainingMapper.fromTrainingToAddTrainingResponse(savedTraining);
  }

  private void initializeTrainingGroupsStatus(Training training) {
    training
        .getGroups()
        .forEach(
            trainingGroup -> {
              TrainingGroupStatus status =
                  (trainingGroup.getIdSupplier() != null)
                      ? TrainingGroupStatus.Validation_formateur
                      : TrainingGroupStatus.Recherche_formateur;
              trainingGroup.setStatus(status);
            });
  }

  /*********************** End Add Training ****************/

  /************************** Start Get Training by id *********************************/
  @Override
  public TrainingResponse getById(Long idTraining) {
    Training training = findTrainingById(idTraining);
    enrichTrainingWithClient(training);
    enrichTrainingWithVendor(training);
    return trainingMapper.fromTrainingToTrainingResponse(training);
  }

  /****************************** End Get Training by id *************************************/

  /****************************** Start Update Training *************************************************/
  @Override
  public AddTrainingResponse updateTraining(
      AddTrainingRequest addTrainingRequest, Long idTraining) {
    Training training =
        trainingRepository
            .findById(idTraining)
            .orElseThrow(
                () ->
                    new TrainingNotFoundException("Training with id " + idTraining + " not found"));
    // Mise à jour des champs de formation
    updateTrainingFields(training, addTrainingRequest);

    // Mise à jour des groupes
    updateTrainingGroups(training, addTrainingRequest.getGroups());

    Training save = trainingRepository.save(training);
    return trainingMapper.fromTrainingToAddTrainingResponse(save);
  }

  // ✅ Mise à jour des champs de formation (séparation des responsabilités)
  private void updateTrainingFields(Training training, AddTrainingRequest request) {
    training.setIdClient(request.getIdClient());
    training.setTheme(request.getTheme());
    training.setTotalNumberOfDays(request.getTotalNumberOfDays());
    training.setTotalStaff(request.getTotalStaff());
    training.setDailyAmount(request.getDailyAmount());
    training.setAmount(request.getAmount());

    if (request.getTrainingDates() != null) {
      training.getTrainingDates().clear();
      training.getTrainingDates().addAll(request.getTrainingDates());
    }
  }

  private void updateTrainingGroups(Training training, List<TrainingGroup> newGroups) {
    if (newGroups == null) {
      return;
    }

    Map<Long, TrainingGroup> existingGroups =
        training.getGroups().stream()
            .collect(Collectors.toMap(TrainingGroup::getIdGroup, Function.identity()));

    List<TrainingGroup> updatedGroups = new ArrayList<>();

    for (TrainingGroup newGroup : newGroups) {
      if (newGroup.getIdGroup() != null && existingGroups.containsKey(newGroup.getIdGroup())) {
        // Groupe existant, on le met à jour
        TrainingGroup existingGroup = existingGroups.get(newGroup.getIdGroup());

        if (existingGroup.getIdSupplier() == null && newGroup.getIdSupplier() != null) {
          existingGroup.setStatus(TrainingGroupStatus.Validation_formateur);
        }

        updateExistingGroup(existingGroup, newGroup);
        updatedGroups.add(existingGroup);
      } else {
        // Nouveau groupe à ajouter
        newGroup.setStatus(
            newGroup.getIdSupplier() != null
                ? TrainingGroupStatus.Validation_formateur
                : TrainingGroupStatus.Recherche_formateur);
        updatedGroups.add(newGroup);
      }
    }

    // Mise à jour des groupes dans la formation
    training.getGroups().clear();
    training.getGroups().addAll(updatedGroups);
  }

  private void updateExistingGroup(TrainingGroup existingGroup, TrainingGroup newGroup) {
    existingGroup.setLabel(newGroup.getLabel());
    existingGroup.setStartDate(newGroup.getStartDate());
    existingGroup.setEndDate(newGroup.getEndDate());
    existingGroup.setIdSupplier(newGroup.getIdSupplier());
    existingGroup.setGroupStaff(newGroup.getGroupStaff());
    existingGroup.setLocation(newGroup.getLocation());
    existingGroup.setNumberOfDays(newGroup.getNumberOfDays());
    existingGroup.setGroupAmount(newGroup.getGroupAmount());
    existingGroup.setCompletionDate(newGroup.getCompletionDate());

    if (newGroup.getGroupDates() != null) {
      existingGroup.getGroupDates().clear();
      existingGroup.getGroupDates().addAll(newGroup.getGroupDates());
    }
  }

  //  void checkGroupStatus(Training training, AddTrainingRequest addTrainingRequest) {
  //    training.getGroups().forEach(trainingGroup -> {
  //      addTrainingRequest.getGroups().forEach(group -> {
  //        if (trainingGroup.getIdSupplier() == null && group.getIdSupplier() != null ) {}
  //      });
  //    });
  //  }
  /******************************** End Update Training **********************************************/

  @Override
  public TrainingDTO deleteTraining(Long idTraining) {
    return null;
  }

  @Override
  public AddTrainingRequest addPv(String pv, Long idTraining) {
    return null;
  }

  @Override
  public TrainingDTO removePv(Long idTraining, TrainingDTO trainingDTO) {
    return null;
  }

  @Override
  public AddTrainingRequest addTrainingSupport(MultipartFile trainingSupport, Long idTraining) {
    return null;
  }

  @Override
  public TrainingDTO removeTrainingSupport(Long idTraining, TrainingDTO trainingDTO) {
    return null;
  }

  @Override
  public List<TrainingDTO> getTrainingsOfWeek() {
    return null;
  }

  @Override
  public List<TrainingInvoiceDTO> getTrainingsByClient(Long idClient) {
    return null;
  }

  @Override
  public TrainingDTO getGroupsByTraining(Long idTraining) {
    return null;
  }

  @Override
  public boolean hasPV(Long idTraining) {
    Training training = trainingRepository.findById(idTraining).orElseThrow(() -> new TrainingNotFoundException("Training with id " + idTraining + " not found"));
    return training != null && training.getPv() != null && !training.getPv().isEmpty();
  }

  @Override
  public boolean hasTrainingSupport(Long idTraining) {
    Training training = trainingRepository.findById(idTraining).orElseThrow(() -> new TrainingNotFoundException("Training with id " + idTraining + " not found"));
    return training !=null && training.getTrainingSupport() != null && training.getTrainingSupport().length > 0;
  }

  @Override
  public List<TrainingDTO> getTrainingsByGroupIds(List<Long> groupIds) {
    return null;
  }

  private void enrichTrainingsWithClientsAndVendors(List<Training> trainings) {
    if (trainings.isEmpty()) {
      log.debug("No trainings to enrich");
      return;
    }

    Set<Long> clientIds = trainings.stream().map(Training::getIdClient).collect(Collectors.toSet());

    Set<Long> supplierIds =
        trainings.stream()
            .flatMap(training -> training.getGroups().stream())
            .map(TrainingGroup::getIdSupplier)
            .collect(Collectors.toSet());

    log.debug(
        "Fetching data for {} clients and {} suppliers", clientIds.size(), supplierIds.size());

    Map<Long, Client> clients =
        Optional.ofNullable(clientRest.findClientsByIds(clientIds))
            .orElse(Collections.emptyList())
            .stream()
            .collect(
                Collectors.toMap(
                    Client::getIdClient,
                    Function.identity(),
                    (existing, replacement) -> {
                      log.warn("Duplicate client found with id {}", existing.getIdClient());
                      return existing;
                    }));

    Map<Long, Vendor> vendors =
        Optional.ofNullable(vendorRest.findVendorsByIds(supplierIds))
            .orElse(Collections.emptyList())
            .stream()
            .collect(
                Collectors.toMap(
                    Vendor::getIdSupplier,
                    Function.identity(),
                    (existing, replacement) -> {
                      log.warn("Duplicate vendor found with id {}", existing.getIdSupplier());
                      return existing;
                    }));

    log.debug("Retrieved {} clients and {} vendors", clients.size(), vendors.size());

    trainings.forEach(
        training -> {
          Client client = clients.get(training.getIdClient());
          if (client == null) {
            log.warn(
                "No client found for training {} with client id {}",
                training.getIdTraining(),
                training.getIdClient());
          }
          training.setClient(client);

          training
              .getGroups()
              .forEach(
                  group -> {
                    Vendor vendor = vendors.get(group.getIdSupplier());
                    if (vendor == null) {
                      log.warn(
                          "No vendor found for group {} with supplier id {}",
                          group.getIdGroup(),
                          group.getIdSupplier());
                    }
                    group.setSupplier(vendor);
                  });
        });

    log.debug("Completed enrichment of {} trainings", trainings.size());
  }

  private void calculateTrainingAmount(Training training) {
    double totalAmount = 0;

    for (TrainingGroup group : training.getGroups()) {
      // Calculer le montant du groupe
      double groupAmount = group.getNumberOfDays() * training.getDailyAmount();
      group.setGroupAmount(groupAmount);

      // Ajouter au montant total de la formation
      totalAmount += groupAmount;
    }

    training.setAmount(totalAmount);
  }

  private Training findTrainingById(Long idTraining) {
    return trainingRepository
        .findById(idTraining)
        .orElseThrow(() -> new TrainingNotFoundException("Formation introuvable"));
  }

  private void enrichTrainingWithClient(Training training) {
    Client client = clientRest.findClientById(training.getIdClient());
    training.setClient(client);
  }

  private void enrichTrainingWithVendor(Training training) {
    training
        .getGroups()
        .forEach(
            trainingGroup -> {
              trainingGroup.setSupplier(vendorRest.findVendorById(trainingGroup.getIdSupplier()));
            });
  }
}