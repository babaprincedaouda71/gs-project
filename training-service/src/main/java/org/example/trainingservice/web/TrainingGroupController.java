package org.example.trainingservice.web;

import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import org.example.trainingservice.dto.GroupInvoiceDTO;
import org.example.trainingservice.dto.TrainingDTO;
import org.example.trainingservice.dto.TrainingGroupDTO;
import org.example.trainingservice.entity.TrainingGroup;
import org.example.trainingservice.service.TrainingGroupService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@AllArgsConstructor
@RequestMapping("/trainingGroup")
public class TrainingGroupController {
    private TrainingGroupService trainingGroupService;

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('admin','user')")
    public List<TrainingGroup> getAll() {
        return trainingGroupService.getAllTrainingGroups();
    }

    @GetMapping("/find/{idGroup}")
    @PreAuthorize("hasAnyAuthority('admin','user')")
    public TrainingGroupDTO getGroupById(@PathVariable Long idGroup) {
        return trainingGroupService.getGroupById(idGroup);
    }

    @PutMapping("/updateLifeCycle/{idGroup}")
    @PreAuthorize("hasAuthority('admin')")
    public TrainingGroup updateStatus(@PathVariable Long idGroup, @RequestBody TrainingGroup trainingGroup) {
        return trainingGroupService.updateStatus(idGroup, trainingGroup, trainingGroup.getStatus().toString());
    }

    @PutMapping("/add/pv/{idGroup}")
    @PreAuthorize("hasAuthority('admin')")
    public TrainingGroup addPv(@RequestBody String pv, @PathVariable Long idGroup) {
        return trainingGroupService.addPv(pv, idGroup);
    }

    @PutMapping("/remove/pv/{idGroup}")
    @PreAuthorize("hasAuthority('admin')")
    public TrainingGroup removePv(
            @PathVariable Long idGroup,
            @RequestBody TrainingGroup trainingGroup) {
        return trainingGroupService.removePv(idGroup, trainingGroup);
    }

    @PutMapping(value = {"/add/trainingSupport/{idGroup}"}, consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasAuthority('admin')")
    public TrainingGroup addTrainingSupport(
            @RequestParam(value = "trainingSupport", required = false) MultipartFile trainingSupport,
            @PathVariable Long idGroup) {
        return trainingGroupService.addTrainingSupport(trainingSupport, idGroup);
    }

    @PutMapping("/remove/trainingSupport/{idGroup}")
    @PreAuthorize("hasAuthority('admin')")
    public TrainingGroup removeTrainingSupport(
            @PathVariable Long idGroup,
            @RequestBody TrainingGroup trainingGroup) {
        return trainingGroupService.removeTrainingSupport(idGroup, trainingGroup);
    }

    @PutMapping(value = {"/add/referenceCertificate/{idGroup}"}, consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasAuthority('admin')")
    public TrainingGroup addReferenceCertificate(
            @RequestParam(value = "referenceCertificate", required = false) MultipartFile referenceCertificate,
            @PathVariable Long idGroup) {
        return trainingGroupService.addReferenceCertificate(referenceCertificate, idGroup);
    }

    @PutMapping("/remove/referenceCertificate/{idGroup}")
    @PreAuthorize("hasAuthority('admin')")
    public TrainingGroup removeReferenceCertificate(
            @PathVariable Long idGroup,
            @RequestBody TrainingGroup trainingGroup) {
        return trainingGroupService.removeReferenceCertificate(idGroup, trainingGroup);
    }

    @PutMapping(value = {"/add/trainingNotes/{idGroup}"}, consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasAuthority('admin')")
    public TrainingGroup addTrainingNotes(
            @RequestParam(value = "presenceList", required = false) MultipartFile presenceList,
            @RequestParam(value = "evaluation", required = false) MultipartFile evaluation,
            @PathVariable Long idGroup) {
        return trainingGroupService.addTrainingNotes(presenceList, evaluation, idGroup);
    }

    @PutMapping("/remove/trainingNotes/{idGroup}")
    @PreAuthorize("hasAuthority('admin')")
    public TrainingGroup removeTrainingNotes(
            @PathVariable Long idGroup,
            @RequestBody TrainingGroup trainingGroup) {
        return trainingGroupService.removeTrainingNotes(idGroup, trainingGroup);
    }

    @GetMapping("/find/groupsToBeInvoiced")
    @PreAuthorize("hasAnyAuthority('admin','user')")
    public List<GroupInvoiceDTO> getGroupsToBeInvoiced() {
        return trainingGroupService.getGroupsToBeInvoiced();
    }

    @PutMapping("/updateGroupe")
    @PreAuthorize("hasAuthority('admin')")
    public void markGroupAsInvoiced(@RequestBody TrainingGroup group) {
        trainingGroupService.markGroupAsInvoiced(group);
    }

    @PutMapping("/{groupId}/status")
    public ResponseEntity<?> updateGroupStatus(@PathVariable Long groupId, @RequestBody Map<String, String> request) {
        String newStatus = request.get("status");
        return trainingGroupService.updateGroupStatus(groupId, newStatus);
    }

    @PutMapping("/groups/status")
    public ResponseEntity<?> updateGroupsStatus(@RequestBody List<Long> groupIds) {
        return trainingGroupService.updateGroupsStatus(groupIds);
    }

    @PostMapping("/find/groupsByIds")
    public ResponseEntity<List<GroupInvoiceDTO>> getGroupsByIds(@RequestBody List<Long> groupIds) {
        List<GroupInvoiceDTO> groupsByIds = trainingGroupService.getGroupsByIds(groupIds);
        return ResponseEntity.ok(groupsByIds);
    }
}