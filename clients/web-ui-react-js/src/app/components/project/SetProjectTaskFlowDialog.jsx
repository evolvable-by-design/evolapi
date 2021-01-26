import React, { useEffect, useState } from 'react'
import { Alert, Dialog, Heading, Pane, TextInput, majorScale, Paragraph } from 'evergreen-ui' 

import useFetch from '../../hooks/useFetch'
import ProjectService from '../../services/ProjectService'
import ArrayInput from '../input/ArrayInput'

const SetTaskFlowDialog = ({ projectId, isShown, onSuccessCallback, onCloseComplete }) => {
  const [ taskStatuses, setTaskStatuses ] = useState([])
  const [ taskStatusTransitions, setTaskStatusTransitions ] = useState([])

  const { makeCall, isLoading, success, data, error } = useFetch(() => ProjectService.setTaskStatusFlow(projectId, taskStatuses, taskStatusTransitions))

  useEffect(() => {
    if (success && data) { 
      onSuccessCallback(data)
    }
  }, [success, data, onSuccessCallback, onCloseComplete])

  return <Dialog
    isShown={isShown}
    title='Set the available statuses and transitions of the tasks (step 2/3)'
    isConfirmLoading={isLoading}
    confirmLabel="Next"
    onConfirm={() => makeCall()}
    isConfirmDisabled={taskStatuses.length < 1 || taskStatusTransitions.length < 1 }
    onCloseComplete={() => { if (success) { onSuccessCallback(data) } onCloseComplete() }}
    hasHeader={!(success && data)}
    hasFooter={!success}
    width="auto"
  >
    <div style={{ 'minWidth': '560px' }}>
      { !(success && data) && 
        <Pane width="100%" display="flex" flexDirection="row" flexWrap="wrap" alignItems="flex-start" justifyContent="flex-start">

          <Pane width="100%" >
            <Pane width="100%" display="flex" flexDirection="column" marginBottom={majorScale(3)} alignItems="flex-start">
              <Heading size={500} width="100%" marginBottom={majorScale(1)}>Statuses available for the tasks</Heading>
              <Paragraph marginBottom={majorScale(1)}>Be careful, the same order will be used to display the tasks into columns.</Paragraph>
              <Pane width="100%" >
                <ArrayInput 
                  values={taskStatuses}
                  setValues={setTaskStatuses}
                  required
                  minItems={1}
                  input={({value, setValue, required}) =>
                    <>
                      <TextInput value={value.id || ''} placeholder='Identifier' type='text' width="50%" onChange={e => setValue({ ...value, id: e.target.value })} required={required} />
                      <TextInput value={value.label || ''} placeholder='Label' type='text' width="50%" onChange={e => setValue({ ...value, label: e.target.value })} required={required} />
                    </>
                  }
                />
              </Pane>
            </Pane>
          </Pane>

          <Pane width="100%" >
            <Pane width="100%" display="flex" flexDirection="column" marginBottom={majorScale(3)} alignItems="flex-start">
              <Heading size={500} width="100%" marginBottom={majorScale(1)}>Available transitions between statuses</Heading>
              <Paragraph marginBottom={majorScale(1)}>Use the previously defined identifiers, are * to select all statuses</Paragraph>
              <Pane width="100%" >
                <ArrayInput 
                  values={taskStatusTransitions}
                  setValues={setTaskStatusTransitions}
                  required
                  minItems={1}
                  input={({value, setValue, required}) =>
                    <>
                      <TextInput value={value.from || ''} placeholder='From' type='text' width="50%" onChange={e => setValue({ ...value, from: e.target.value })} required={required} />
                      <TextInput value={value.to || ''} placeholder='To' type='text' width="50%" onChange={e => setValue({ ...value, to: e.target.value })} required={required} />
                    </>
                  }
                />
              </Pane>
            </Pane>
          </Pane>

        </Pane>
      }
      { error && <Alert intent="danger" title={error?.response?.data?.description || error.message || error} marginBottom='16px' /> }
    </div>
  </Dialog>
}

export default SetTaskFlowDialog