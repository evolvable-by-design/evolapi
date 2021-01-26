const express = require('express');

const utils = require('./utils');
const { HypermediaRepresentationBuilder } = require('../hypermedia/hypermedia');
const HypermediaControls = require('../hypermedia/project');
const Errors = require('../utils/errors');
const Responses = require('../utils/responses');
const ReverseRouter = require('../reverse-router');
const { TechnicalIdsExtractor } = require('../utils/router-utils');
const AuthService = require('../services/auth-service');
const { UserRoles } = require('../models/User')

function projectWithHypermediaControls(project, user) {
  return HypermediaRepresentationBuilder
    .of(project)
    .representation(_ => project.representation())
    .link(HypermediaControls.inviteUser(project), project.nextCreationStep === null)
    .link(HypermediaControls.createTask(project), !project.isArchived && project.nextCreationStep === null)
    .link(HypermediaControls.listTasks(project), project.nextCreationStep === null)
    .link(HypermediaControls.reverseArchivedState(project), project.nextCreationStep === null)
    .link(HypermediaControls.delete(project), project.isArchived && user.role === UserRoles.PO && project.nextCreationStep === null)
    .link(HypermediaControls.star(project))
    .link(HypermediaControls.analytics(project))
    .link(HypermediaControls.setTaskStatusesFlow(project), project.nextCreationStep === 1)
    .link(HypermediaControls.setDetails(project), project.nextCreationStep === 2)
    .build();
}

function projectController(projectService, userService) {

  const router = express.Router()

  router.get('/projects', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const { offset, limit } = req.query
      const projects = projectService.list(user.username, offset, limit);
      
      const representation = HypermediaRepresentationBuilder
        .of(projects)
        .representation((p) => p.map(project => projectWithHypermediaControls(project, user)))
        .representation((p) => { return { projects: p };})
        .link(HypermediaControls.createProject)
        .build();

      const projectsCount = projectService.count(user.username)
      if (projectsCount > offset + limit - 1) {
        res.append('X-Next', `/projects/?offset=${offset+limit}&limit=${limit}`);
      }

      res.append('X-Last', `/projects?offset=${projectsCount-limit > 0 ? projectsCount-limit : 0 }&limit=${limit}`)

      res.status(200).json(representation);
    }, res);
  }));

  router.post('/projects', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      if(utils.isEmpty(req.body.name)) {
        res.status(400).send(new Errors.HttpError(400));
      } else {
        const newProject = projectService.create(req.body.name, user.username);
        res.status(201)
          .location(ReverseRouter.forProject(newProject.id))
          .json(projectWithHypermediaControls(newProject, user));
      }
    }, res);
  }));

  router.post('/project/:id/task-status-flow', AuthService.withAuth((req, res, user) =>
    Errors.handleErrorsGlobally(() => {
      const { taskStatuses, taskStatusTransitions } = req.body
      if (taskStatuses == null
        || (taskStatuses instanceof Array && taskStatuses.length === 0)
        || taskStatuses.find(el => el.id == null || el.label == null) !== undefined
        || taskStatusTransitions == null
        || (taskStatusTransitions instanceof Array && taskStatusTransitions.length === 0)
        || taskStatusTransitions.find(el => el.from == null || el.to == null) !== undefined
      ) {
        throw Errors.BusinessRuleEnforced()
      }

      const updatedProject = projectService.setTaskStatusFlow(
        req.params.id,
        user.username,
        taskStatuses,
        taskStatusTransitions,
      )
      Responses.ok(res, projectWithHypermediaControls(updatedProject, user))
    }, res)
  ))

  router.post('/project/:id/details', AuthService.withAuth((req, res, user) =>
    Errors.handleErrorsGlobally(() => {
      if (utils.isEmpty(req.body.description)) {
        throw Errors.BusinessRuleEnforced()
      }

      const updatedProject = projectService.setDetails(
        req.params.id,
        user.username,
        req.body.description,
        req.body.collaborators || []
      )
      Responses.ok(res, projectWithHypermediaControls(updatedProject, user))
    }, res)
  ))

  router.get('/project/:id', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const project = projectService.findById(req.params.id, user.username);
      Responses.ok(res, projectWithHypermediaControls(project, user));
    }, res)
  }));

  router.delete('/project/:id', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      projectService.delete(req.params.id, user);
      Responses.noContent(res);
    }, res)
  }));

  router.post('/project/:id/addCollaborator', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      if (utils.isEmpty(req.body.users) || !(req.body.users instanceof Array) || req.body.users.length > 5) {
        Responses.badRequest(res);
      } else {
        projectService.inviteCollaborators(req.params.id, user.username, req.body.users);
        Responses.noContent(res);
      }
    }, res)
  }));

  router.post('/project/:id/archive', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const newArchivedState = projectService.archive(req.params.id, user.username);
      Responses.ok(res, { isArchived: newArchivedState });
    }, res)
  }));

  router.post('/project/:id/star', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const project = projectService.findById(req.params.id, user.username)
      if (project.nextCreationStep === null) {
        userService.switchStarredStatus(user.username, project.id)
        Responses.noContent(res);
      } else {
        throw new Errors.BusinessRuleEnforced()
      }
    }, res)
  }));

  return router;
}

module.exports = projectController;
