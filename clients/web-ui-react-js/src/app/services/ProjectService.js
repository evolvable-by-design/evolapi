import convert from 'xml-js';

import HttpClient from './HttpClient';
import { extractProjectTechnicalId } from '../utils/ResourceUtils'
import { toText, toBoolean, toArray } from '../utils/XmlUtils'

class ProjectService {

  async list({offset, limit, url}) {
    const response = await HttpClient().get(
      url ? url : `/projects?offset=${offset || 0}&limit=${limit || 10}`
    )

    const data = parseProjectsListXml(response.data)
    return { projects: data.projects, nextPage: response.headers['x-next'], lastPage: response.headers['x-last'] }
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
    return response.data.isArchived
  }

  async setTaskStatusFlow(projectId, taskStatuses, taskStatusTransitions) {
    const tecnicalId = extractProjectTechnicalId(projectId)
    const response = await HttpClient().post(
      `/project/${tecnicalId}/task-status-flow`,
      { taskStatuses, taskStatusTransitions }
    )
    return response.data
  }

  async setDetails(projectId, description, collaborators) {
    const tecnicalId = extractProjectTechnicalId(projectId)
    const response = await HttpClient().post(
      `/project/${tecnicalId}/details`,
      { description, collaborators }
    )
    return response.data
  }

}

function parseProjectsListXml(xml) {
  const convertedData = convert.xml2js(`<root>${xml}</root>`, {compact: true})

  const projects = toArray(convertedData.root.projects).map(project => ({
    id: toText(project.id),
    name: toText(project.name),
    isArchived: toBoolean(project.isArchived),
    collaborators: toArray(project.collaborators).map(toText),
    description: toText(project.description),
    availableTaskStatuses: toArray(project.availableTaskStatuses)
      .map(status => ({
        id: toText(status.id),
        label: toText(status.label)
      })),
    taskStatusTransitions: toArray(project.taskStatusTransitions)
      .map(status => ({
        from: toText(status.from),
        to: toText(status.to)
      })),
    nextCreationStep: toText(project.nextCreationStep, null)
  }))

  const links = toArray(convertedData.root.projects).map(link => {
    if (link.relation !== undefined) {
      // does not support parameters parsing
      return toText(link.relation)
    } else {
      return toText(link)
    }
  })

  return {
    projects,
    _links: links
  }
}

export default new ProjectService()