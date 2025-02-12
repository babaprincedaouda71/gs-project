package org.example.trainingservice.web;

import lombok.AllArgsConstructor;
import org.example.trainingservice.dto.*;
import org.example.trainingservice.service.TrainingService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/training")
public class TrainingController {
  private TrainingService trainingService;

  @GetMapping("/all")
  @PreAuthorize("hasAnyAuthority('admin','user')")
  public List<TrainingResponse> getTrainings() {
    return trainingService.getTrainings();
  }

  @PostMapping("/add")
  @PreAuthorize("hasAuthority('admin')")
  public AddTrainingResponse addTraining(@RequestBody AddTrainingRequest addTrainingRequest) {
    return trainingService.addTraining(addTrainingRequest);
  }

  @PutMapping("/update/{idTraining}")
  @PreAuthorize("hasAuthority('admin')")
  public AddTrainingResponse updateTraining(
      @RequestBody AddTrainingRequest addTrainingRequest, @PathVariable Long idTraining) {
    return trainingService.updateTraining(addTrainingRequest, idTraining);
  }

  @GetMapping("/find/{idTraining}")
  @PreAuthorize("hasAnyAuthority('admin','user')")
  public TrainingResponse getTraining(@PathVariable Long idTraining) {
    return trainingService.getById(idTraining);
  }

  @DeleteMapping("/delete/{idTraining}")
  @PreAuthorize("hasAuthority('admin')")
  public TrainingDTO deleteTraining(@PathVariable Long idTraining) {
    return trainingService.deleteTraining(idTraining);
  }

  @GetMapping("/trainingsOfWeek")
  @PreAuthorize("hasAnyAuthority('admin','user')")
  public List<TrainingDTO> getTrainingsOfWeek() {
    return trainingService.getTrainingsOfWeek();
  }

  @PutMapping("/add/pv/{idTraining}")
  @PreAuthorize("hasAuthority('admin')")
  public AddTrainingRequest addPv(@RequestBody String pv, @PathVariable Long idTraining) {
    return trainingService.addPv(pv, idTraining);
  }

  @PutMapping("/remove/pv/{idTraining}")
  @PreAuthorize("hasAuthority('admin')")
  public TrainingDTO removePv(@PathVariable Long idTraining, @RequestBody TrainingDTO trainingDTO) {
    return trainingService.removePv(idTraining, trainingDTO);
  }

  @PutMapping(
      value = {"/add/trainingSupport/{idTraining}"},
      consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
  @PreAuthorize("hasAuthority('admin')")
  public AddTrainingRequest addTrainingSupport(
      @RequestParam(value = "trainingSupport", required = false) MultipartFile trainingSupport,
      @PathVariable Long idTraining) {
    return trainingService.addTrainingSupport(trainingSupport, idTraining);
  }

  @PutMapping("/remove/trainingSupport/{idTraining}")
  @PreAuthorize("hasAuthority('admin')")
  public TrainingDTO removeTrainingSupport(
      @PathVariable Long idTraining, @RequestBody TrainingDTO trainingDTO) {
    return trainingService.removeTrainingSupport(idTraining, trainingDTO);
  }

  @GetMapping("/find/trainingsByClient/{idClient}")
  @PreAuthorize("hasAuthority('admin')")
  public List<TrainingInvoiceDTO> getTrainingsByClient(@PathVariable Long idClient) {
    return trainingService.getTrainingsByClient(idClient);
  }

  /************************** Gestion des groupes *****************************/
  @GetMapping("/find/groupsByTraining/{idTraining}")
  @PreAuthorize("hasAnyAuthority('admin','user')")
  public TrainingDTO getGroupsByTraining(@PathVariable Long idTraining) {
    return trainingService.getGroupsByTraining(idTraining);
  }

  @GetMapping("/checkPv/{idTraining}")
  @PreAuthorize("hasAnyAuthority('admin','user')")
  public ResponseEntity<Boolean> hasPV(@PathVariable Long idTraining) {
    boolean hasPV = trainingService.hasPV(idTraining);
    return ResponseEntity.ok(hasPV);
  }

  @GetMapping("/checkTrainingSupport/{idTraining}")
  @PreAuthorize("hasAnyAuthority('admin','user')")
  public ResponseEntity<Boolean> hasTrainingSupport(@PathVariable Long idTraining) {
    boolean hasTrainingSupport = trainingService.hasTrainingSupport(idTraining);
    return ResponseEntity.ok(hasTrainingSupport);
  }

  @PostMapping("/filteredByGroup")
  public ResponseEntity<List<TrainingDTO>> getFilteredTrainings(@RequestBody List<Long> groupIds) {
    List<TrainingDTO> filteredTrainings = trainingService.getTrainingsByGroupIds(groupIds);
    return ResponseEntity.ok(filteredTrainings);
  }
}