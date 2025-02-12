package org.example.trainingservice.mapper;

import java.util.ArrayList;
import org.example.trainingservice.dto.*;
import org.example.trainingservice.entity.Training;
import org.example.trainingservice.entity.TrainingGroup;
import org.example.trainingservice.enums.TrainingGroupStatus;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@Service
public class TrainingMapper {
  private final ModelMapper modelMapper = new ModelMapper();

  public TrainingResponse fromTrainingToTrainingResponse(Training training) {
    return modelMapper.map(training, TrainingResponse.class);
  }

  public Training fromAddTrainingRequestToTraining(AddTrainingRequest addTrainingRequest) {
    return modelMapper.map(addTrainingRequest, Training.class);
  }

  public AddTrainingResponse fromTrainingToAddTrainingResponse(Training training) {
    return modelMapper.map(training, AddTrainingResponse.class);
  }

  public TrainingDTO fromTraining(Training trainingFalse) {
    return modelMapper.map(trainingFalse, TrainingDTO.class);
  }

  public AddTrainingRequest fromTrainingToAddTrainingDTO(Training training) {
    return modelMapper.map(training, AddTrainingRequest.class);
  }

  public Training fromTrainingDTO(TrainingDTO trainingDTO) {
    return modelMapper.map(trainingDTO, Training.class);
  }

  public Training fromAddTrainingDTO(AddTrainingRequest addTrainingRequest) {
    return modelMapper.map(addTrainingRequest, Training.class);
  }

  public TrainingInvoiceDTO toTrainingInvoiceDTO(Training training) {
    return modelMapper.map(training, TrainingInvoiceDTO.class);
  }

//  public TrainingGroup mapToTrainingGroup(TrainingGroup dto) {
//    TrainingGroup group = new TrainingGroup();
//    group.setLabel(dto.getLabel());
//    group.setStartDate(dto.getStartDate());
//    group.setEndDate(dto.getEndDate());
//    group.setIdSupplier(dto.getIdSupplier());
//    group.setGroupStaff(dto.getGroupStaff());
//    group.setLocation(dto.getLocation());
//    group.setNumberOfDays(dto.getNumberOfDays());
//    group.setGroupAmount(dto.getGroupAmount());
//    group.setCompletionDate(dto.getCompletionDate());
//    group.setStatus(dto.getStatus());
//
//    if (dto.getGroupDates() != null) {
//      group.setGroupDates(new ArrayList<>(dto.getGroupDates()));
//    }
//
//    return group;
//  }
}