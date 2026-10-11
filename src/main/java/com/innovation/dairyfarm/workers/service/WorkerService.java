package com.innovation.dairyfarm.workers.service;

import com.innovation.dairyfarm.auth.domain.User;
import com.innovation.dairyfarm.workers.dto.WorkerRequest;
import com.innovation.dairyfarm.workers.domain.Worker;

import java.util.List;

public interface WorkerService {
    Worker create(User owner, WorkerRequest request);
    Worker update(Long ownerId, Long id, WorkerRequest request);
    void delete(Long ownerId, Long id);
    Worker findById(Long ownerId, Long id);
    List<Worker> findAll(Long ownerId);
}
