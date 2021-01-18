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

function taskWithHypermediaControls(task) {
  return HypermediaRepresentationBuilder
    .of(task)
    .representation(t => t.taskRepresentation(ReverseRouter))
    .link(HypermediaControls.update(task))
    .link(HypermediaControls.delete(task))
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
  
      const tasks = projectService.existsWithId(queryProjectId, user.id)
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
        .representation((t) => t.map(taskWithHypermediaControls))
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
        const { title, description, status, assignee, tags, priority } = cleanedBodyValues;
        if (utils.isAnyEmpty([title, assignee])
          || !validateBusinessConstraints(undefined, title, description, undefined, status, tags, priority)
        ) {
          Responses.badRequest(res);
        } else {
          const createdTask = createFunction(cleanedBodyValues);
          Responses.created(res, taskWithHypermediaControls(createdTask));
        }
      }, res);
    })(req, res);
  };

  router.post('/tasks/technicalStory', createTask(taskService.createTechnicalStory.bind(taskService)));

  router.post('/tasks/userStory', createTask(taskService.createUserStory.bind(taskService)));

  router.get('/task/:taskId', AuthService.withAuth((req, res) => {
    Errors.handleErrorsGlobally(() => {
      const taskId = req.params.taskId;
      const task = taskService.findById(taskId);

      if (task) {
        Responses.ok(res, taskWithHypermediaControls(task));
      } else {
        Responses.notFound(res);
      }
    }, res);
  }));

  router.put('/task/:taskId', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const taskId = req.params.taskId;

      const { title, description, status, points, tags, priority} = req.body;
      const task = taskService.findById(taskId)
      if (!task) {
        Responses.notFound(res);
      } else if (!validateBusinessConstraints(task, title, description, points, status, tags, priority)) {
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
        taskService.delete(taskId);
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

  router.put('/task/:taskId/toQa', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const taskId = req.params.taskId;
      taskService.updateStatus(taskId, TaskStatus.qa);
      Responses.noContent(res);
    }, res);
  }));

  router.put('/task/:taskId/complete', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const taskId = req.params.taskId;
      taskService.updateStatus(taskId, TaskStatus.complete);
      Responses.noContent(res);
    }, res);
  }));

  router.post(`/task/:taskId/archive`, AuthService.withAuth((req, res) => {
    Errors.handleErrorsGlobally(() => {
      const taskId = req.params.taskId;
      const newArchivedState = taskService.switchArchivedStatus(taskId);
      Responses.ok(res, { isArchived: newArchivedState });
    }, res);
  }));

  return router;

}

function replaceRelationUrlsWithTechnicalIds(object) {
  const toReturn = Object.assign({}, object)

  if (toReturn['assignee']) {
    const ids = TechnicalIdsExtractor.extractUserIdParams(toReturn['assignee'])
    toReturn['assignee'] = ids ? ids.userId : undefined
  }

  if (toReturn['parentProjectId']) {
    const ids = TechnicalIdsExtractor.extractProjectIdParams(toReturn['parentProjectId'])
    toReturn['parentProjectId'] = ids ? ids.id : undefined
  }

  return toReturn
}

module.exports = taskController;
