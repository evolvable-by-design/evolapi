class Task {
  constructor(id, title, points, projectId, description, assignee, creationDate, lastUpdate, status, isArchived, updatesCount, tags, priority) {
    this.id = id;
    this.title = title;
    this.points = points;
    this.projectId = projectId;
    this.description = description;
    this.assignee = assignee;
    this.status = status;
    this.isArchived = isArchived;
    this.updatesCount = updatesCount;
    this.tags = tags;
    this.priority = priority;
  }

  isUserStory() { return this.points !== undefined }

  isTechnicalStory() { return !this.isUserStory() }

  static ofUserStory(id, projectId, title, description, assignee, points, status, tags, priority) {
    return new Task(id, title, points, projectId, description || '', assignee, status, false, tags, priority);
  }

  static ofUserStory(id, projectId, title, description, assignee, creationDate, points, status, tags, priority) {
    return new Task(id, title, points, projectId, description || '', assignee, creationDate, new Date(Date.now()), status, false, 0, tags, priority);
  }

  static ofTechnicalStory(id, projectId, title, description, assignee, creationDate, status, tags, priority) {
    return new Task(id, title, undefined, projectId, description, assignee, creationDate, new Date(Date.now()), status, false, 0, tags, priority);
  }

  taskRepresentation() {
    const representation = {
      id: this.id,
      title: this.title,
      parentProjectId: this.projectId,
      description: this.description || '',
      assignee: reverseRouter.forUser(this.assignee),
      status: this.status,
      // isArchived: this.isArchived,
      updatesCount: this.updatesCount,
      tags: this.tags,
      priority: this.priority
    };

    if (this.isUserStory()) {
      representation['points'] = this.points;
    }

    return representation;
  }

};

const TaskStatus = {
  todo: 'todo',
  inProgress: 'todo',
  review: 'review',
  qa: 'QA',
  complete: 'done'
};

const TaskStatusFreeToMove = {
  todo: 'todo',
  inProgress: 'in progress',
  review: 'review'
};

const Priority = {
  blocking: 'blocking',
  important: 'important',
  high: 'high',
  medium: 'medium',
  low: 'low',
  simple: 'simple',
  critical: 'critical'
}

const validateBusinessConstraints = (task, title, description, points, status) => {
  if (title && (title.length <3 || title.length > 40)) {
    return false;
  } else if (points && (points < 0 || points > 120)) {
    return false;
  } else if (tags && tags.length > 10) {
    return false;
  } else if (priority && !Object.values(Priority).includes(priority)) {
    return false;
  } else if (tags && tags.length > 6) {
    return false;
  } else if (priority && !Object.values(Priority).includes(priority)) {
    return false;
  } else {
    return true;
  }
};

module.exports = {
  TaskStatus,
  TaskStatusFreeToMove,
  validateBusinessConstraints,
  Task,
  Priority
}