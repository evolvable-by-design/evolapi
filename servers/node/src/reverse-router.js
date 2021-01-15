const Project = require('./models/Project');
const { User } = require('./models/User');
const { Task } = require('./models/Task');

const ReverseRouter = {

  forUser: function(userId) {
    if (userId === undefined) return undefined
    return '/user/' + userId
  },

  forProject: function(projectId) {
    if (projectId === undefined) return undefined
    return '/project/' + projectId;
  },

  forTask: function(taskId, projectId) {
    if (taskId === undefined || projectId === undefined) return undefined
    return '/project/' + projectId + '/task/' + taskId
  },

  resolve: function(value) {
    if (value instanceof User) {
      return this.forUser(value.id);
    } else if (value instanceof Project) {
      return this.forProject(value.id);
    } else if (value instanceof Task) {
      return this.forTask(value.id, value.projectId);
    }
  }

};

module.exports = ReverseRouter 
