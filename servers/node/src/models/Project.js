const Errors = require('../utils/errors');

class Project {

  constructor(id, name, isArchived, collaborators, description, availableTaskStatuses, taskStatusTransitions, nextCreationStep) {
    this.id = id;
    this.name = name;
    this.isArchived = isArchived;
    this.collaborators = collaborators;
    this.description = description;
    this.availableTaskStatuses = availableTaskStatuses;
    this.taskStatusTransitions = taskStatusTransitions;
    this.nextCreationStep = nextCreationStep || 1;
  }

  static of(id, name, creatorId) {
    return new Project(id, name, false, [creatorId]);
  }

  addCollaborators(collaborators) {
    collaborators.forEach(c => this.collaborators.push(c))
    this.collaborators = this.collaborators.filter((v,i) => this.collaborators.indexOf(v) === i)
  }

  continueCreation(options) {
    if (this.nextCreationStep === 1) {
      this.availableTaskStatuses = options.taskStatuses
      this.taskStatusTransitions = options.taskStatusTransitions
      this.nextCreationStep = 2
      return this
    } else if (this.nextCreationStep === 2) {
      this.description = options.description
      options.collaborators.forEach(collaborator => this.collaborators.push(collaborator))
      this.nextCreationStep = null
      return this
    } else {
      throw Errors.BusinessRuleEnforced()
    }
  }

  representation() {
    return {
      id: this.id,
      name: this.name,
      isArchived: this.isArchived,
      collaborators: this.collaborators,
      description: this.description,
      availableTaskStatuses: this.availableTaskStatuses,
      taskStatusTransitions: this.taskStatusTransitions,
      nextCreationStep: this.nextCreationStep !== null
        ? PROJECT_CREATION_STEPS_LABEL[this.nextCreationStep]
        : PROJECT_CREATION_STEPS_LABEL[3] // CREATION_COMPLETED
    }
  }

}

const PROJECT_CREATION_STEPS_LABEL = [
  'INITIALIZATION',
  'TASK_FLOW_SETUP',
  'INFORMATION_SETUP',
  'CREATION_COMPLETED'
]

module.exports = Project;
