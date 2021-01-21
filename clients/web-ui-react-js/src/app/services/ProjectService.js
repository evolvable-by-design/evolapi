import HttpClient from './HttpClient'
import { extractProjectTechnicalId } from '../utils/ResourceUtils'

class ProjectService {

  async list(offset, limit) {
    const response = await HttpClient().get(
      `/projects?offset=${offset || 0}&limit=${limit || 5}`
    )
    return response.data.projects
  }

  async create(name) {
    const response = await HttpClient().post(
      '/projects',
      { name }
    )
    return response.data
  }

  async findOne(id) {
    const tecnicalId = extractProjectTechnicalId(id)
    const response = await HttpClient().get(`/project/${tecnicalId}`)
    return response.data
  }

  async deleteOne(id) {
    const tecnicalId = extractProjectTechnicalId(id)
    const response = await HttpClient().delete(`/project/${tecnicalId}`)
    return response.status === '204'
  }

  async addCollaborator(projectId, users) {
    const tecnicalId = extractProjectTechnicalId(projectId)
    const response = await HttpClient().post(`/project/${tecnicalId}/addCollaborator`, { users })
    return response.status === '204'
  }

  async archive(projectId) {
    const tecnicalId = extractProjectTechnicalId(projectId)
    const response = await HttpClient().post(`/project/${tecnicalId}/archive`)
    return response.status === '204'
  }

  async star(projectId) {
    const tecnicalId = extractProjectTechnicalId(projectId)
    const response = await HttpClient().post(`/project/${tecnicalId}/star`)
    return response.status === '204'
  }

}

export default new ProjectService()