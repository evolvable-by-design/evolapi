const express = require('express');

const Errors = require('../utils/errors');
const Responses = require('../utils/responses');
const AuthService = require('../services/auth-service');
const ReverseRouter = require('../reverse-router');

const analyticController = function(analyticService, projectService, taskService) {

  const router = express.Router();

  router.get('/analytics/:resourceId', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const resourceId = req.params.resourceId;
      const maybeAnalytic = analyticService.findByResourceId(resourceId)

      if (!maybeAnalytic) {
        Responses.notFound(res)
      } else {
        const representation = maybeAnalytic.representation(ReverseRouter)
        representation.resourceId = resolveResourceUri(representation.resourceId, projectService, taskService)
        Responses.ok(res, representation)
      }
    }, res);
  }));

  return router;

}

function resolveResourceUri(resourceId, projectService, taskService) {
  const project = projectService.findById(resourceId)
  if (project) return ReverseRouter.forProject(resourceId)

  const task = taskService.findById(resourceId)
  if (task) return ReverseRouter.forTask(resourceId, task.projectId)
}

module.exports = analyticController;