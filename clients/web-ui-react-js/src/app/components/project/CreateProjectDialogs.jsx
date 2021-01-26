import React, { useEffect, useState } from 'react'

import CreateProjectDialog from './CreateProjectDialog'
import SetProjectTaskFlowDialog from './SetProjectTaskFlowDialog'
import SetProjectDetailsDialog from './SetProjectDetailsDialog'

const CreateProjectDialogs = ({ project, onSuccessCallback, ...dialogProps }) => {
  const { onCloseComplete } = dialogProps
  const [ actualProject, setActualProject ] = useState(project)

  useEffect(() => setActualProject(project), [project])

  const step = actualProject === undefined ? 'INITIALIZATION' : actualProject.nextCreationStep

  if (step === 'INITIALIZATION') {
    return <CreateProjectDialog onSuccessCallback={setActualProject} {...dialogProps} />
  } else if (actualProject && step === 'INFORMATION_SETUP') {
    return <SetProjectDetailsDialog  projectId={actualProject.id} onSuccessCallback={setActualProject} {...dialogProps}/>
  } else if (actualProject && step === 'TASK_FLOW_SETUP') {
    return <SetProjectTaskFlowDialog projectId={actualProject.id} onSuccessCallback={setActualProject} {...dialogProps}/>
  } else if (actualProject && step === 'CREATION_COMPLETED') {
    onSuccessCallback(actualProject)
    return null
  } else {
    console.error('The project is at an unsupported creation step')
    onCloseComplete()
    return null
  }
}

export default CreateProjectDialogs
