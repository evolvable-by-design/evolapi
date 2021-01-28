const uuid = require('uuid/v4');

const { Task, TaskStatus } = require('../models/Task');
const Errors = require('../utils/errors');
const { UserRoles } = require('../models/User');

class TaskService {

  constructor(taskRepository, analyticService, projectRepository) {
    this.taskRepository = taskRepository;
    this.analyticService = analyticService;
    this.projectRepository = projectRepository;
  }

  list(projectId, createdBefore, offset, limit) {
    return this.listAll(projectId, createdBefore).slice(offset, offset + limit);
  }

  listAll(projectId, createdBefore) {
    return this.taskRepository.all().filter(task => 
      projectId === undefined || task.projectId === projectId
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

  delete(taskId, user) {
    if (user.role !== UserRoles.PO) {
      throw new Errors.ForbiddenException()
    }
    
    const task = this.findByIdOrFail(taskId);
    if (task) {
      this.taskRepository.delete(task)
      this.analyticService.update(task.id)
    } else {
      throw new Errors.BusinessRuleEnforced();
    }
  }

  createTechnicalStory({ title, description, assignee, status, tags, priority, parentProjectId }) {
    const createdTask = Task.ofTechnicalStory(uuid(), parentProjectId, title, description, assignee, status || TaskStatus.todo, tags, priority);
    this.taskRepository.save(createdTask);
    this.analyticService.create(createdTask.id);
    return createdTask;
  }

  createUserStory({ title, description, assignee, status, points, tags, priority, parentProjectId }) {
    const createdTask = Task.ofUserStory(uuid(), parentProjectId, title, description, assignee, points, status || TaskStatus.todo, tags, priority);
    this.taskRepository.save(createdTask);
    this.analyticService.create(createdTask.id);
    return createdTask;
  }

  updateTask(taskId, { title, details, points, tags, priority }) {
    const { description, assignee } = details

    const task = this.findByIdOrFail(taskId);
    if (title) { task.title = title; }
    if (description) { task.description = description; }
    if (assignee) { task.assignee = assignee; }
    if (points && task.isUserStory()) { task.points = points; }
    if (tags) { task.tags = tags }
    if (priority) { task.priority = priority }

    if (title || description || assignee || points || tags || priority) { this.analyticService.update(taskId); }
  }

  updateStatus(taskId, status) {
    const task = this.findByIdOrFail(taskId);
    const project = this.projectRepository.findById(task.projectId);

    const isUpdateAuthorized = this._isStatusUpdateAuthorized(task, project, status)
    if (isUpdateAuthorized) {
      task.status = status;
      this.analyticService.update(taskId);
    } else {
      throw new Errors.BusinessRuleEnforced()
    }
  }

  archive(taskId) {
    this._archive(taskId, true)
  }

  unarchive(taskId) {
    this._archive(taskId, false)
  }

  _archive(taskId, newState) {
    const task = this.findByIdOrFail(taskId)
    task.isArchived = newState
    this.analyticService.update(taskId);
  }

  _isStatusUpdateAuthorized(task, project, newStatus) {
    const currentStatus = task.status

    if (currentStatus === newStatus) { return true }

    const separateCommaDelimitedStatuses = (str) => str.split(',').map(el => el.trim())

    if (project.availableTaskStatuses.find(status => status.id === newStatus) === undefined) {
      return false
    }

    const transitionAllowingThisUpdate = project.taskStatusTransitions
      .filter(transition =>
        transition.from === '*' ||
        separateCommaDelimitedStatuses(transition.from).indexOf(currentStatus) !== -1
      )
      .find(transition =>
        transition.to === '*' ||
        separateCommaDelimitedStatuses(transition.to).indexOf(newStatus) !== -1
      )

    return transitionAllowingThisUpdate !== undefined
  }

}

module.exports = TaskService;
