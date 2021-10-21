import React from 'react'
import { Card, CardBody, Text } from '@pancakeswap/uikit'
import styled from 'styled-components'
import useTheme from '../../hooks/useTheme'

const StyledCardWrapper = styled.div`
  min-width: 300px;

  @media screen and (min-width: 968px) and (max-width: 1120px) {
    min-width: 221px;
  }
  
  @media screen and (max-width: 967px) {
    min-width: 300px;
  }
  
  @media screen and (max-width: 735px) {
    min-width: 216px;
  }

  @media screen and (max-width: 576px) {
    min-width: 0;
    
    ${CardBody} {
      padding: 8px;
    }
  }
`

const StyledValueText = styled(Text)`
  @media screen and (max-width: 375px) {
    font-size: 16px;
  }
`

interface ISinglePriceCard {
  title: string
  data: string
}

export const SinglePriceCard = (props: ISinglePriceCard) => {
  const { theme } = useTheme()

  const { title, data } = props

  return (
    <StyledCardWrapper>
      <Card padding="0" background={theme.colors.background}>
        <CardBody>
          <Text color="textSubtle2" textTransform="capitalize" fontSize="14px" mb="12px">
            {title}
          </Text>
          <StyledValueText color="text" textTransform="capitalize" fontSize="20px">
            {data}
          </StyledValueText>
        </CardBody>
      </Card>
    </StyledCardWrapper>
  )
}
