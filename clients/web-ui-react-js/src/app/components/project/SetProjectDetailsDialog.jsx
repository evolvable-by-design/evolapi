import React, { useEffect, useState } from 'react'
import { Alert, Dialog, Pane, TextInput } from 'evergreen-ui' 

import useFetch from '../../hooks/useFetch'
import ProjectService from '../../services/ProjectService'
import ArrayInput from '../input/ArrayInput'
import WithLabel from '../input/WithLabel'

const SetProjectDetailsDialog = ({ projectId, isShown, onSuccessCallback, onCloseComplete }) => {
  const [ description, setDescription ] = useState('')
  const [ collaborators, setCollaborators ] = useState([])

  const { makeCall, isLoading, success, data, error } = useFetch(() => ProjectService.setDetails(projectId, description, collaborators))

  useEffect(() => {
    if (success && data) { 
      onSuccessCallback(data)
    }
  }, [success, data, onSuccessCallback, onCloseComplete])

  return <Dialog
    isShown={isShown}
    title='Set the project details (step 2/3)'
    isConfirmLoading={isLoading}
    confirmLabel="Create project"
    onConfirm={() => makeCall()}
    isConfirmDisabled={description === ''}
    onCloseComplete={() => { if (success) { onSuccessCallback(data) } onCloseComplete() }}
    hasHeader={!(success && data)}
    hasFooter={!success}
    width="auto"
  >
    <div style={{ 'minWidth': '560px' }}>
      { !(success && data) && 
        <Pane width="100%" display="flex" flexDirection="row" flexWrap="wrap" alignItems="flex-start" justifyContent="flex-start">

          <Pane width="100%" >
            <WithLabel label='Description' required>
              <TextInput
                isInvalid={description.length < 1}
                value={description}
                type="text"
                width="100%"
                onChange={e => setDescription(e.target.value)}
              />
            </WithLabel>
          </Pane>

          <Pane width="100%" >
            <WithLabel label='collaborators' required>
              <ArrayInput 
                values={collaborators}
                setValues={setCollaborators}
                required
                minItems={1}
                maxItems={5}
                input={({value, setValue, required}) =>
                  <TextInput value={value} type='text' width="100%" onChange={e => setValue(e.target.value)} required={required} />
                }
              />
            </WithLabel> 
          </Pane>

        </Pane>
      }
      { error && <Alert intent="danger" title={error?.response?.data?.description || error.message || error} marginBottom='16px' /> }
    </div>
  </Dialog>
}

export default SetProjectDetailsDialog