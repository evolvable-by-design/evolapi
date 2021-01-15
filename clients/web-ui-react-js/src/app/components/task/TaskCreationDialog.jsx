import React, { useEffect, useState } from 'react'
import { Alert, Dialog, Pane, Textarea, TextInput } from 'evergreen-ui' 

import useFetch from '../../hooks/useFetch'
import { TaskTypes } from '../../domain/Task'
import TaskService from '../../services/TaskService'
import SelectInput from '../input/SelectInput'
import WithLabel from '../input/WithLabel'

const TaskCreationDialog = ({ projectId, onSuccessCallback, onCloseComplete, type }) => {
  const [ title, setTitle ] = useState()
  const [ description, setDescription ] = useState()
  const [ assignee, setAssignee ] = useState()
  const [ points, setPoints ] = useState()
  const [ status, setStatus ] = useState()
  const { makeCall, isLoading, success, data, error } = useFetch(() => TaskService.create(projectId, type, {title, description, assignee, points}))

  useEffect(() => {
    if (success && data) { 
      onSuccessCallback()
      onCloseComplete()
    }
  }, [success, data, onSuccessCallback, onCloseComplete])

  return <Dialog
    isShown={true}
    title='Create task'
    isConfirmLoading={isLoading}
    confirmLabel="Create"
    onConfirm={() => makeCall()}
    onCloseComplete={() => { if (success) { onSuccessCallback(data) } onCloseComplete() }}
    hasFooter={!success}
    width="700px"
  >
    <div>
      { !(success && data) && 
        <>
          <Pane width="100%" display="flex" flexDirection="row" flexWrap="wrap" alignItems="flex-start" justifyContent="flex-start">

            <Pane width="100%" >
              <WithLabel label='Title' required>
                <TextInput
                  isInvalid={title && (title.length < 3 || title.length > 140)}
                  value={title || ''}
                  type='text'
                  width="100%"
                  onChange={e => setTitle(e.target.value)}
                />
              </WithLabel>
            </Pane>

            <Pane width="100%" >
              <WithLabel label='Assignee' required>
                <TextInput
                  value={assignee || ''}
                  width="100%"
                  type='text'
                  onChange={e => setAssignee(e.target.value)}
                />
              </WithLabel>
            </Pane>

            <Pane width="100%" >
              <WithLabel label='Description'>
                <Textarea
                  isInvalid={description && (description.length > 2000)}
                  validationMessage={description && description.length > 2000 ? 'Max length is 2000' : undefined}
                  value={description || ''}
                  width="100%"
                  onChange={e => setDescription(e.target.value)}
                />
              </WithLabel>
            </Pane>

            { type === TaskTypes.UserStory && 
              <Pane width="100%" >
                <WithLabel label='Points' required>
                <TextInput
                  isInvalid={points && (points < 0)}
                  validationMessage={points && points < 0 ? 'Can only be a positive number' : undefined}
                  value={points}
                  type='number'
                  width="100%"
                  onChange={e => setPoints(e.target.value)}
                />
                </WithLabel>
              </Pane>
            }

            <Pane width="100%" >
              <WithLabel label='Status'>
                <SelectInput 
                  options={Array.from(new Set([ 'todo', 'in progress', 'review' ]))}
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  required={false}
                />
              </WithLabel>
            </Pane>
            
          </Pane>
        </>
      }
      { error && <Alert intent="danger" title={error.message || error} marginBottom='16px' /> }
    </div>
  </Dialog>
}

export default TaskCreationDialog