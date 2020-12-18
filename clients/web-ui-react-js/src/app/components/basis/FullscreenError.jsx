import React from 'react';

import FullscreenCenterContainer from '../layout/FullscreenCenterContainer'
import Error from './Error'

const FullScreenError = ({error}) => {
  return <FullscreenCenterContainer>
    <Error error={error instanceof Error ? error.message : error} />
  </FullscreenCenterContainer>
}

export default FullScreenError