package org.example.trainingservice.service;

import org.example.trainingservice.dto.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TrainingService {
    List<TrainingResponse> getTrainings();

    AddTrainingResponse addTraining(AddTrainingRequest addTrainingRequest);

    TrainingResponse getById(Long idTraining);

    AddTrainingResponse updateTraining(AddTrainingRequest addTrainingRequest, Long idTraining);

    TrainingDTO deleteTraining(Long idTraining);

    AddTrainingRequest addPv(String pv, Long idTraining);

    TrainingDTO removePv(Long idTraining, TrainingDTO trainingDTO);

    AddTrainingRequest addTrainingSupport(MultipartFile trainingSupport, Long idTraining);

    TrainingDTO removeTrainingSupport(Long idTraining, TrainingDTO trainingDTO);

    List<TrainingDTO> getTrainingsOfWeek();

    List<TrainingInvoiceDTO> getTrainingsByClient(Long idClient);

    TrainingDTO getGroupsByTraining(Long idTraining);

    boolean hasPV(Long idTraining);

    boolean hasTrainingSupport(Long idTraining);

    List<TrainingDTO> getTrainingsByGroupIds(List<Long> groupIds);
}