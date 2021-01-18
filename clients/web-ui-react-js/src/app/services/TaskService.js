import HttpClient from '../services/HttpClient'
import { TaskTypes } from '../domain/Task'
import { parseLinkHeader } from '../utils/HttpUtils'

class TaskService {

  static async list(projectId, offset, limit, createdBefore) {
    const params = []
    params.push(`queryProjectId=${projectId}`)
    if (offset) params.push(`offset=${offset}`)
    if (limit) params.push(`limit=${limit}`)
    if (createdBefore) params.push(`createdBefore=${createdBefore}`)

    const url = params.reduce((url, param, i) =>
      url + (i === 0 ? '?' : '&') + param,
      `/tasks`
    )

    return TaskService._fetchAndFormatTaskListResult(url)
  }

  static async _fetchAndFormatTaskListResult(url) {
    const response = await HttpClient().get(url)

    const links = parseLinkHeader(response.headers['link'])

    const nextPage = links.findBy('rel', 'hydra:next')?.value
    const lastPage = links.findBy('rel', 'hydra:last')?.value
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

  static async create(type, task) {
    if (type === TaskTypes.TechnicalStory) {
      return HttpClient().post(`/tasks/technicalStory`, task)
    } else if (type === TaskTypes.UserStory) {
      return HttpClient().post(`/tasks/userStory`, task)
    } else {
      return new Promise((_, rej) => rej(new Error('Incorrect task type provided')))
    }
  }

  static async findOne(taskId) {
    return HttpClient().get(`/task/${taskId}`)
  }

  static async update(task) {
    return HttpClient().put(`/task/${task.id}`, task)
  }

  static async toQa(taskId) {
    return HttpClient().put(`/task/${taskId}/toQa`)
  }

  static async complete(taskId) {
    return HttpClient().put(`/task/${taskId}/complete`)
  }

  static async delete(taskId) {
    return HttpClient().delete(`/task/${taskId}`)
  }

}

export default TaskService
