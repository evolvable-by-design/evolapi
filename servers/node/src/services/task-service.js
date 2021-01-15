const uuid = require('uuid/v4');

const { Task, TaskStatus } = require('../models/Task');
const Errors = require('../utils/errors');

class TaskService {

  constructor(taskRepository, analyticService) {
    this.taskRepository = taskRepository;
    this.analyticService = analyticService;

    this.createUserStory({ title: 'First task', assignee: 'f19869bc-a117-4c19-bc12-d907de312632', status: 'todo', points: 1 }, '0e4a7fdb-b97e-42bf-a657-a61d88efb737');
  }

  list(projectId, createdBefore, offset, limit) {
    return this.listAll(projectId, createdBefore).slice(offset, offset + limit);
  }

  listAll(projectId, createdBefore) {
    return this.taskRepository.all().filter(task => 
      task.projectId === projectId
      && (!createdBefore || task.creationDate < createdBefore)
    );
  }
 
  findById(taskId) {
    return this.taskRepository.all().find(task => task.id === taskId);
  }

  findByIdOrFail(taskId) {
    const task = this.taskRepository.all().find(task => task.id === taskId);
    if (task) {
      return task;
    } else {
      throw new Errors.NotFound();
    }
  }

  tasksCount(projectId, createdBefore) {
    return this.listAll(projectId, createdBefore).length;
  }

  delete(taskId) {
    const task = this.findByIdOrFail(taskId);
    if (task) {
      this.taskRepository.delete(task)
      this.analyticService.update(task.id)
    } else {
      throw new Errors.BusinessRuleEnforced();
    }
  }

  createTechnicalStory({ title, description, assignee, status, tags, priority }, projectId) {
    const createdTask = Task.ofTechnicalStory(uuid(), projectId, title, description, assignee, status || TaskStatus.todo, tags, priority);
    this.taskRepository.save(createdTask);
    this.analyticService.create(createdTask.id);
    return createdTask;
  }

  createUserStory({ title, description, assignee, status, points, tags, priority }, projectId) {
    const createdTask = Task.ofUserStory(uuid(), projectId, title, description, assignee, points, status || TaskStatus.todo, tags, priority);
    this.taskRepository.save(createdTask);
    this.analyticService.create(createdTask.id);
    return createdTask;
  }

  updateTask(taskId, { title, description, assignee, status, points, tags, priority }) {
    const task = this.findByIdOrFail(taskId);
    if (title) { task.title = title; }
    if (description) { task.description = description; }
    if (assignee) { task.assignee = assignee; }
    if (status) { task.status = status; }
    if (points && task.isUserStory()) { task.points = points; }
    if (tags) { task.tags = tags }
    if (priority) { task.priority = priority }

    if (title || description || assignee || status || points || tags || priority) { this.analyticService.update(taskId); }
  }

  updateStatus(taskId, status) {
    const task = this.findByIdOrFail(taskId);
    task.status = status;
    this.analyticService.update(taskId);
  }

}

module.exports = TaskService;
