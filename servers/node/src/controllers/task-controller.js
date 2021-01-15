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
    .build();
}

const taskController = function(projectService, taskService) {

  const router = express.Router();

  router.get('/tasks', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const queryProjectId = req.params.queryProjectId;
      const createdBefore = req.query.createdBefore;
      const offset = Number(req.query.offset) || 0;
      const limit = Number(req.query.limit) || 3;
  
      const projectId = projectService.existsWithId(queryProjectId, user.id) ? queryProjectId : undefined
      const tasks = taskService.list(projectId, createdBefore ? new Date(createdBefore) : undefined, offset, limit);

      var basePageUrl = `/tasks?`;
      if (createdBefore) { basePageUrl += `createdBefore=${createdBefore}&`; }
      if (projectId) { basePageUrl += `queryProjectId=${projectId}&`;}

      const amountOfTasks = taskService.tasksCount(projectId, createdBefore);
      if (amountOfTasks > offset + limit - 1) {
        res.append('X-Next', basePageUrl + `offset=${offset+limit}&limit=${limit}`);
      }

      res.append('X-Last', basePageUrl + `offset=${amountOfTasks-limit > 0 ? amountOfTasks-limit : 0 }&limit=${limit}`);

      const representation = HypermediaRepresentationBuilder
        .of(tasks)
        .representation((t) => t.map(taskWithHypermediaControls))
        .representation((t) => ({ tasks: t }))
        .link(HypermediaControls.create(projectId))
        .build();

      res.status(200).json(representation);
    }, res);
  }));

  const createTask = function(createFunction) {
    return (req, res) => AuthService.withAuth((_, __, user) => {
      Errors.handleErrorsGlobally(() => {
        const cleanedBodyValues = replaceRelationUrlsWithTechnicalIds(req.body);
        const { title, description, status, assignee, tags, priority, parentProjectId, points } = cleanedBodyValues;
        console.log(title, assignee, parentProjectId)
        console.log(utils.isAnyEmpty([title, assignee, parentProjectId]))
        console.log(!validateBusinessConstraints(undefined, title, description, points, status, tags, priority))
        console.log(!projectService.existsWithId(parentProjectId, user.id))
        if (utils.isAnyEmpty([title, assignee, parentProjectId])
          || !validateBusinessConstraints(undefined, title, description, points, status, tags, priority)
          || !projectService.existsWithId(parentProjectId, user.id)
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
