import React, { useEffect } from 'react';
import { Link } from 'react-router-dom'
import { Card, Heading, Pane, Paragraph, majorScale } from 'evergreen-ui';

import AnalyticsService from '../../services/AnalyticsService';

import UserId from '../user/UserId'
import useFetch from '../../hooks/useFetch'

const ProjectCard = ({id, title, collaborators, nextCreationStep, continueProjectCreation }) => {
  const { makeCall, data: analytics } = useFetch(() => AnalyticsService.findOne(id))

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => makeCall(), [])

  return <StatelessProjectCard id={id} title={title} collaborators={collaborators} nextCreationStep={nextCreationStep} lastUpdate={analytics?.lastUpdatedOn} continueProjectCreation={continueProjectCreation} />
}

const StatelessProjectCard = ({id, title, lastUpdate, collaborators, nextCreationStep, continueProjectCreation}) =>
  <Card display="flex" flexDirection="column" elevation={1} hoverElevation={3} width={majorScale(40)} padding={majorScale(2)} marginRight={majorScale(3)} marginBottom={majorScale(3)} minHeight="100px" >
    <Pane display="flex" flexDirection="row" marginBottom={majorScale(2)}>
      { nextCreationStep === null
        ? <Link to={`/project/${id}`} style={{flexGrow: 10}}><Heading>{title}</Heading></Link>
        : <Link to='#' style={{flexGrow: 10}}><Heading onClick={continueProjectCreation}>{title}</Heading></Link>
      }
    </Pane>
    <Paragraph><b>Last updated on: </b>{lastUpdate}</Paragraph>
    <Pane>
      <Heading size={300} marginBottom={majorScale(1)} >Collaborators</Heading>
      <Pane display='flex' direction='row' alignItems='center' justifyContent='flex-start'>
        { collaborators.map(collaborator => <UserId key={collaborator} username={collaborator} noLabel />)}
      </Pane>
    </Pane>
  </Card>

export default ProjectCard;