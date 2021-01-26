const uuid = require('uuid/v4');

const Project = require('../models/Project');
const Errors = require('../utils/errors');
const { UserRoles } = require('../models/User');

class ProjectService {

  constructor(projectRepository, analyticService) {
    this.projectRepository = projectRepository;
    this.analyticService = analyticService;
  }

  list(username, offset, limit) {
    const actualOffset = offset || 0;
    const actualLimit = limit || 5;

    return this.projectRepository.all()
      .filter(project => project.collaborators.includes(username))
      .slice(actualOffset, actualOffset + actualLimit)
  }

  count(username) {
    return this.projectRepository.all()
      .filter(project => project.collaborators.includes(username))
      .length
  }

  findById(id, username) {
    const project = this.projectRepository.all().find(p => p.id === id);

    if (project === undefined) {
      throw new Errors.NotFound()
    } else if (project.collaborators.includes(username)) {
      return project
    } else {
      throw new Errors.ForbiddenException()
    }
  }

  existsWithId(id, username) {
    try {
      this.findById(id, username)
      return true
    } catch (error) {
      return false
    }
  }

  existsWithName(name, username) {
    return this.projectRepository.all()
      .find(p => p.name === name && p.collaborators.includes(username)) !== undefined;
  }

  create(name, owner) {
    const maybeDulicatedExistingProject = this.existsWithName(name, owner);

    if (maybeDulicatedExistingProject) {
      throw new Errors.BusinessRuleEnforced();
    } else {
      const createdProject = Project.of(uuid(), name, owner);
      this.projectRepository.save(createdProject);
      this.analyticService.create(createdProject.id);
      return createdProject;
    }
  }

  setTaskStatusFlow(id, username, taskStatuses, taskStatusTransitions) {
    return this._nextCreationStep(id, username, 2, { taskStatuses, taskStatusTransitions })
  }

  setDetails(id, username, description, collaborators) {
    return this._nextCreationStep(id, username, 1, { description, collaborators })
  }

  _nextCreationStep(id, username, stepIndex, options) {
    const project = this.findById(id, username);

    if (!project) {
      throw new Errors.NotFound();
    } else if (project.nextCreationStep !== stepIndex) {
      throw new Errors.BusinessRuleEnforced();
    } else {
      const newProjectState = project.continueCreation(options)
      this.analyticService.update(project.id);
      return newProjectState
    }
  }

  delete(id, user) {
    if (user.role !== UserRoles.PO) {
      throw new Errors.ForbiddenException()
    }

    const project = this.findById(id, user.username);

    if (!project) {
      throw new Errors.NotFound();
    } else if (!project.isArchived || project.nextCreationStep !== null) {
      throw new Errors.BusinessRuleEnforced();
    } else {
      this.analyticService.update(project.id);
      return this.projectRepository.delete(project);
    }
  }

  archive(id, username) {
    const project = this.findById(id, username);

    if (!project) {
      throw new Errors.NotFound();
    } else if (project.nextCreationStep !== null) {
      throw new Errors.BusinessRuleEnforced('The project creation must have been completed.');
    } else {
      project.isArchived = !project.isArchived;
      this.analyticService.update(project.id);
      return project.isArchived;
    }
  }

  inviteCollaborators(id, requesterId, collaboratorsToAdd) {
    const project = this.findById(id, requesterId);

    if (!project) {
      throw new Errors.NotFound();
    } else if (project.nextCreationStep !== null) {
      throw new Errors.BusinessRuleEnforced('The project creation must have been completed.');
    } else {
      project.addCollaborators(collaboratorsToAdd);
      this.analyticService.update(project.id);
    }
  }

  getInitialStatus(projectId) {
    const project = this.projectRepository.all().find(p => p.id === projectId);
    return project.availableTaskStatuses[0].id
  }

}

module.exports = ProjectService;
