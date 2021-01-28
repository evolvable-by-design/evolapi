const express = require('express');

const { TaskStatus, validateBusinessConstraints } = require('../models/Task');
const { HypermediaRepresentationBuilder } = require('../hypermedia/hypermedia');
const HypermediaControls = require('../hypermedia/task');
const utils = require('./utils');
const Errors = require('../utils/errors');
const Responses = require('../utils/responses');
const AuthService = require('../services/auth-service');
const ReverseRouter = require('../reverse-router');
const { TechnicalIdsExtractor } = require('../utils/router-utils');
const { UserRoles } = require('../models/User');

function taskWithHypermediaControls(task, user) {
  return HypermediaRepresentationBuilder
    .of(task)
    .representation(t => t.taskRepresentation(ReverseRouter))
    .link(HypermediaControls.update(task))
    .link(HypermediaControls.delete(task), user.role === UserRoles.PO)
    .link(HypermediaControls.moveToQa(task), task.status !== TaskStatus.qa)
    .link(HypermediaControls.complete(task), task.status === TaskStatus.qa)
    .link(HypermediaControls.analytics(task))
    .link(HypermediaControls.reverseArchivedState(task))
    .build();
}

const taskController = function(projectService, taskService) {

  const router = express.Router();

  router.get('/tasks', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const queryProjectId = req.query.queryProjectId;
      const createdBefore = req.query.createdBefore;
      const offset = Number(req.query.offset) || 0;
      const limit = Number(req.query.limit) || 3;
  
      const tasks = projectService.existsWithId(queryProjectId, user.username)
        ? taskService.list(queryProjectId, createdBefore ? new Date(createdBefore) : undefined, offset, limit)
        : []

      var basePageUrl = `/tasks?`;
      if (createdBefore) { basePageUrl += `createdBefore=${createdBefore}&`; }
      if (queryProjectId) { basePageUrl += `queryProjectId=${queryProjectId}&`;}

      const amountOfTasks = taskService.tasksCount(queryProjectId, createdBefore);
      let linkHeaderValue = '';
      if (amountOfTasks > offset + limit - 1) {
        linkHeaderValue += `<${basePageUrl}offset=${offset+limit}&limit=${limit}>; rel=hydra:next,`
      }

      linkHeaderValue += `<${basePageUrl}offset=${amountOfTasks-limit > 0 ? amountOfTasks-limit : 0}&limit=${limit}>; rel=hydra:last`
      res.append('Link', linkHeaderValue)

      const representation = HypermediaRepresentationBuilder
        .of(tasks)
        .representation((t) => t.map(task => taskWithHypermediaControls(task, user)))
        .representation((t) => ({ tasks: t }))
        .link(HypermediaControls.create(queryProjectId))
        .build();

      res.status(200).json(representation);
    }, res);
  }));

  const createTask = function(createFunction) {
    return (req, res) => AuthService.withAuth((_, __, user) => {
      Errors.handleErrorsGlobally(() => {
        const cleanedBodyValues = replaceRelationUrlsWithTechnicalIds(req.body);
        const { title, description, assignee, tags, priority, parentProjectId } = cleanedBodyValues;
        if (utils.isAnyEmpty([title, assignee])
          || !validateBusinessConstraints(undefined, title, description, undefined, tags, priority)
        ) {
          Responses.badRequest(res);
        } else {
          const initialStatus = projectService.getInitialStatus(parentProjectId)
          const createdTask = createFunction({...cleanedBodyValues, status: initialStatus});
          Responses.created(res, taskWithHypermediaControls(createdTask, user));
        }
      }, res);
    })(req, res);
  };

  router.post('/tasks/technicalStory', createTask(taskService.createTechnicalStory.bind(taskService)));

  router.post('/tasks/userStory', createTask(taskService.createUserStory.bind(taskService)));

  router.get('/task/:taskId', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const taskId = req.params.taskId;
      const task = taskService.findById(taskId);

      if (task) {
        Responses.ok(res, taskWithHypermediaControls(task, user));
      } else {
        Responses.notFound(res);
      }
    }, res);
  }));

  router.put('/task', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const cleanedBodyValues = replaceRelationUrlsWithTechnicalIds(req.body)
      const { id: taskId, title, details, points, tags, priority} = cleanedBodyValues;
      const { description } = details

      const task = taskService.findById(taskId)

      if (!task) {
        Responses.notFound(res);
      }

      projectService.findById(task.projectId, user.username)
      
      if (!validateBusinessConstraints(task, title, description, points, status, tags, priority)) {
        Responses.badRequest(res);
      } else {
        taskService.updateTask(taskId, replaceRelationUrlsWithTechnicalIds(req.body));
        Responses.noContent(res);
      }
    }, res);
  }));

  router.delete('/task/:taskId', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const taskId = req.params.taskId;

      try {
        taskService.delete(taskId, user);
        Responses.noContent(res);
      } catch (error) {
        if (error instanceof Errors.BusinessRuleEnforced) {
          Responses.status(400).json(
            HypermediaRepresentationBuilder.of({
              errorMessage: 'The task must be archived to be removable'
            })
              .link(HypermediaControls.beforeDeletion())
          )
        } else {
          throw error
        }
      }
    }, res);
  }));

  router.put('/task/:taskId/status', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const taskId = req.params.taskId;
      taskService.updateStatus(taskId, req.body.status, user.username);
      Responses.noContent(res);
    }, res);
  }))

  router.put(`/task/:taskId/archive`, AuthService.withAuth((req, res) => {
    Errors.handleErrorsGlobally(() => {
      const taskId = req.params.taskId;
      taskService.archive(taskId);
      Responses.noContent(res);
    }, res);
  }));

  router.put(`/task/:taskId/unarchive`, AuthService.withAuth((req, res) => {
    Errors.handleErrorsGlobally(() => {
      const taskId = req.params.taskId;
      taskService.unarchive(taskId);
      Responses.noContent(res);
    }, res);
  }));

  return router;

}

function replaceRelationUrlsWithTechnicalIds(object) {
  const toReturn = Object.assign({}, object)

  if (toReturn['parentProjectId']) {
    const ids = TechnicalIdsExtractor.extractProjectIdParams(toReturn['parentProjectId'])
    toReturn['parentProjectId'] = ids ? ids.id : undefined
  }

  return toReturn
}

module.exports = taskController;
