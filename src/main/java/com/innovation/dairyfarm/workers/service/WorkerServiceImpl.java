package com.innovation.dairyfarm.workers.service;

import com.innovation.dairyfarm.common.exception.ResourceNotFoundException;
import com.innovation.dairyfarm.farm.domain.Farm;
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
    public Worker create(Farm farm, WorkerRequest request) {
        Worker worker = Worker.builder()
                .name(request.name())
                .role(request.role())
                .phone(request.phone())
                .startDate(request.startDate())
                .status(request.status())
                .monthlySalary(request.monthlySalary())
                .build();
        worker.setFarm(farm);
        return workerRepository.save(worker);
    }

    @Override
    public Worker update(Long farmId, Long id, WorkerRequest request) {
        Worker worker = findById(farmId, id);
        worker.setName(request.name());
        worker.setRole(request.role());
        worker.setPhone(request.phone());
        worker.setStartDate(request.startDate());
        worker.setStatus(request.status());
        worker.setMonthlySalary(request.monthlySalary());
        return workerRepository.save(worker);
    }

    @Override
    public void delete(Long farmId, Long id) {
        Worker worker = findById(farmId, id);
        workerRepository.delete(worker);
    }

    @Override
    @Transactional(readOnly = true)
    public Worker findById(Long farmId, Long id) {
        return workerRepository.findByIdAndFarmId(id, farmId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with id " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Worker> findAll(Long farmId) {
        return workerRepository.findAllByFarmId(farmId);
    }
}
