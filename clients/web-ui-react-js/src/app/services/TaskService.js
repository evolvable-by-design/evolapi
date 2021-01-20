import HttpClient from '../services/HttpClient'
import { extractProjectTechnicalId } from '../utils/ResourceUtils'
import { TaskTypes } from '../domain/Task'

class TaskService {

  static async list(projectId, offset, limit, createdBefore) {
    const params = []
    if (offset) params.push(`offset=${offset}`)
    if (limit) params.push(`limit=${limit}`)
    if (createdBefore) params.push(`createdBefore=${createdBefore}`)

    const url = params.reduce((url, param, i) =>
      url + (i === 0 ? '?' : '&') + param,
      `/project/${projectId}/tasks`
    )

    return TaskService._fetchAndFormatTaskListResult(url)
  }

  static async _fetchAndFormatTaskListResult(url) {
    const response = await HttpClient().get(url)
    const nextPage = response.headers['x-next']
    const lastPage = response.headers['x-last']
    return {
      tasks: response.data.tasks,
      nextPage,
      fetchNextPage: nextPage !== undefined
        ? async () => TaskService._fetchAndFormatTaskListResult(nextPage)
        : undefined,
      lastPage,
      fetchLastPage: lastPage !== undefined
        ? async () => TaskService._fetchAndFormatTaskListResult(lastPage)
        : undefined,
    }
  }

  static async create(projectId, type, task) {
    const projectTechnicalId = extractProjectTechnicalId(projectId)
    if (type === TaskTypes.TechnicalStory) {
      return HttpClient().post(`/project/${projectTechnicalId}/tasks/technicalStory`, task)
    } else if (type === TaskTypes.UserStory) {
      return HttpClient().post(`/project/${projectTechnicalId}/tasks/userStory`, task)
    } else {
      return new Promise((_, rej) => rej(new Error('Incorrect task type provided')))
    }
  }

  static async findOne(projectId, taskId) {
    const projectTechnicalId = extractProjectTechnicalId(projectId)
    return HttpClient().get(`/project/${projectTechnicalId}/task/${taskId}`)
  }

  static async update(projectId, task) {
    const projectTechnicalId = extractProjectTechnicalId(projectId)
    return HttpClient().put(`/project/${projectTechnicalId}/task/${task.id}`, task)
  }

  static async toQa(projectId, taskId) {
    const projectTechnicalId = extractProjectTechnicalId(projectId)
    return HttpClient().put(`/project/${projectTechnicalId}/task/${taskId}/toQa`)
  }

  static async complete(projectId, taskId) {
    const projectTechnicalId = extractProjectTechnicalId(projectId)
    return HttpClient().put(`/project/${projectTechnicalId}/task/${taskId}/complete`)
  }

  static async delete(projectId, taskId) {
    const projectTechnicalId = extractProjectTechnicalId(projectId)
    return HttpClient().delete(`/project/${projectTechnicalId}/task/${taskId}`)
  }

}

export default TaskService