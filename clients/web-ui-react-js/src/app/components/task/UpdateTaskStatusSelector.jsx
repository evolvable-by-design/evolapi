import { Pane, Paragraph, Select, Spinner } from 'evergreen-ui'
import React, { useCallback, useState } from 'react'

import TaskService from '../../services/TaskService'

const UpdateTaskStatusSelector = ({ taskId, currentStatus, availableTaskStatuses, taskStatusTransitions, onChange }) => {
  const [ newStatus, setNewStatus ] = useState(currentStatus)

  const [ isLoading, setIsLoading ] = useState(false)
  const [ error, setError ] = useState()

  const onValueChange = useCallback((status) => {
    const call = async () => {
      setIsLoading(true)
      setNewStatus(status)
      try {
        await TaskService.updateStatus(taskId, status)
        setNewStatus(status)
        setError(undefined)
        onChange()
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    call()
  }, [taskId, onChange])

  const reachableStatuses = getReachableStatuses(currentStatus, availableTaskStatuses, taskStatusTransitions)

  const selectFieldProps = error !== undefined ? {
    isInvalid: false,
  } : isLoading ? {
    disabled: true
  } : {
    onChange: e => onValueChange(e.target.value)
  }

  return (
    <Pane>
      <Select
        value={newStatus}
        width='100%'
        {...selectFieldProps}
      >
        { reachableStatuses.map(status => 
          <option key={status.id} value={status.id}>
            {isLoading ? <Spinner size={16} /> : null} {status.label}
          </option>
        )}
      </Select>
      { error === undefined ? undefined : <Paragraph color='red'>{error.message}</Paragraph>}
    </Pane>
  )
}

function getReachableStatuses(currentStatus, availableTaskStatuses, taskStatusTransitions) {
  const separateCommaDelimitedStatuses = (str) => str.split(',').map(el => el.trim())

  const reachableStatusesId = taskStatusTransitions
    .filter(transition =>
      transition.from === '*' ||
      separateCommaDelimitedStatuses(transition.from).indexOf(currentStatus) !== -1
    )
    .map(transition => transition.to)
    .concat(currentStatus)

  return availableTaskStatuses.filter(status => reachableStatusesId.indexOf(status.id) !== -1 || reachableStatusesId.indexOf('*') !== -1)
}

export default UpdateTaskStatusSelector
