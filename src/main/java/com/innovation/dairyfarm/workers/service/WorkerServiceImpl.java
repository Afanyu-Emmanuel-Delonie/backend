package com.innovation.dairyfarm.workers.service;

import com.innovation.dairyfarm.auth.domain.User;
import com.innovation.dairyfarm.common.exception.ResourceNotFoundException;
import com.innovation.dairyfarm.workers.domain.Worker;
import com.innovation.dairyfarm.workers.dto.WorkerRequest;
import com.innovation.dairyfarm.workers.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkerServiceImpl implements WorkerService {

    private final WorkerRepository workerRepository;

    @Override
    public Worker create(User owner, WorkerRequest request) {
        Worker worker = Worker.builder()
                .name(request.name())
                .role(request.role())
                .phone(request.phone())
                .startDate(request.startDate())
                .status(request.status())
                .monthlySalary(request.monthlySalary())
                .build();
        worker.setOwner(owner);
        return workerRepository.save(worker);
    }

    @Override
    public Worker update(Long ownerId, Long id, WorkerRequest request) {
        Worker worker = findById(ownerId, id);
        worker.setName(request.name());
        worker.setRole(request.role());
        worker.setPhone(request.phone());
        worker.setStartDate(request.startDate());
        worker.setStatus(request.status());
        worker.setMonthlySalary(request.monthlySalary());
        return workerRepository.save(worker);
    }

    @Override
    public void delete(Long ownerId, Long id) {
        Worker worker = findById(ownerId, id);
        workerRepository.delete(worker);
    }

    @Override
    @Transactional(readOnly = true)
    public Worker findById(Long ownerId, Long id) {
        return workerRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with id " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Worker> findAll(Long ownerId) {
        return workerRepository.findAllByOwnerId(ownerId);
    }
}
