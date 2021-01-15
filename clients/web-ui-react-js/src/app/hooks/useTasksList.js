import { useCallback, useState } from 'react'
import TaskService from "../services/TaskService"

export default function useTasksList(projectId, offset, limit, createdAfter) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState()
  const [success, setSuccess] = useState(false)
  const [data, setData] = useState()

  const callback = (newData) => {
    setData(newData)
    setSuccess(true)
    setError(undefined)
  }

  const makeCall = useCallback(() => {
    const call = async () => {
      setIsLoading(true)
      try {
        const response = await TaskService.list(projectId, offset, limit, createdAfter)
        callback(response.tasks)
        await fetchNextPages(response.tasks, response, callback)
      } catch (error) {
        setData(undefined)
        setSuccess(false)
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }

    call()
  }, [projectId, offset, limit, createdAfter])

  return { makeCall, isLoading, success, data, error }
}

async function fetchNextPages(acc, tasksList, callback) {
  if (tasksList.fetchNextPage !== undefined) {
    const result = await tasksList.fetchNextPage()
    const newAcc = acc.concat(result.tasks)
    callback(newAcc)
    await fetchNextPages(newAcc, result, callback)
  }
}
