package com.innovation.dairyfarm.workers.service;

import com.innovation.dairyfarm.farm.domain.Farm;
import com.innovation.dairyfarm.workers.dto.WorkerRequest;
import com.innovation.dairyfarm.workers.domain.Worker;

import java.util.List;

public interface WorkerService {
    Worker create(Farm farm, WorkerRequest request);
    Worker update(Long farmId, Long id, WorkerRequest request);
    void delete(Long farmId, Long id);
    Worker findById(Long farmId, Long id);
    List<Worker> findAll(Long farmId);
}
