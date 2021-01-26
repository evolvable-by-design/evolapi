import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import qs from 'qs'
import { Badge, Dialog, Heading, Pane, Paragraph, Pill, majorScale } from 'evergreen-ui'

import ActionsSelector from './ActionsSelector'
import AnalyticsService from '../../services/AnalyticsService'
import ContainerWithLabel from '../input/ContainerWithLabel'
import TextWithLabel from '../input/TextWithLabel'
import useFetch from '../../hooks/useFetch'
import UserId from '../user/UserId'
import UpdateTaskStatusSelector from './UpdateTaskStatusSelector'

const TaskDialog = ({ id, assignee, title, description, points, status, tags, priority, isArchived, actions, availableTaskStatuses, taskStatusTransitions, refreshTaskList }) => {
  const history = useHistory()

  // lastupdate creationDate
  const { makeCall, data: analytics } = useFetch(() => AnalyticsService.findOne(id))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => makeCall(), [])


  return <Dialog
    isShown={true}
    title={title}
    onCloseComplete={() => hideTaskDialog(history)}
    width={Math.min(document.body.clientWidth*0.7, 1200)}
    maxHeight={document.body.clientHeight*0.8}
    hasFooter={false}
  >
    <Pane display="flex" flexDirection="row">
      <Pane flexGrow={10} display="flex" flexDirection="column" marginRight={majorScale(2)}>
        <Paragraph marginBottom={majorScale(1)}><Badge>{id}</Badge></Paragraph>
        <Heading size={500} marginBottom={majorScale(2)}>Description</Heading>
        <Paragraph>{description || 'Empty description'}</Paragraph>
      </Pane>
      <Pane flexGrow={1} minWidth="200px" display="flex" flexDirection="column">

        { isArchived &&
          <Pane marginBottom={8}>
            <Badge color='orange'>Archived</Badge>
          </Pane>
        }

        <Pane>
          <ActionsSelector actions={actions} onSelect={value => showTaskActionDialog(value, history)} />
        </Pane>

        <ContainerWithLabel label='Assignee'>
          <UserId username={assignee} />
        </ContainerWithLabel>

        { points && <ContainerWithLabel label='Points'>
            <Pill display="inline-flex" color={points < 8 ? 'green' : points < 14 ? 'orange' : 'red'}>{points}</Pill>
          </ContainerWithLabel>}

        <ContainerWithLabel label='Status'>
          <UpdateTaskStatusSelector taskId={id} currentStatus={status} availableTaskStatuses={availableTaskStatuses} taskStatusTransitions={taskStatusTransitions} onChange={refreshTaskList} />
        </ContainerWithLabel>

        { priority && <TextWithLabel label='Priority'><Badge>{priority}</Badge></TextWithLabel> }

        { tags && <ContainerWithLabel label='Tags'>
          { tags.map(tag => <Badge key={tag} color="neutral" marginRight={8}>{tag}</Badge>) }
        </ContainerWithLabel>}

        { analytics?.lastUpdatedOn && <TextWithLabel label='Last update on'>{analytics.lastUpdatedOn}</TextWithLabel> }
        { analytics?.createdOn && <TextWithLabel label='Created on'>{analytics.createdOn}</TextWithLabel> } 
      </Pane>
    </Pane>
  </Dialog>
}

function hideTaskDialog(history) {
  const query = qs.parse(window.location.search.substring(1))
  delete query.taskFocus
  history.push(`${window.location.pathname}?${qs.stringify(query)}`)
}

function showTaskActionDialog(key, history) {
  const query = qs.parse(window.location.search.substring(1))
  query['actionFocus'] = key
  history.push(`${window.location.pathname}?${qs.stringify(query)}`)
}

export default TaskDialog