import React from 'react'
import { Text, ErrorIcon, Grid } from '@pancakeswap/uikit'
import styled, { css } from 'styled-components'
import { AutoColumn } from 'components/Layout/Column'
import ChartCard from '../../Info/components/InfoCharts/ChartCard'

export const Wrapper = styled.div<{ padding?: string }>`
  position: relative;
  padding: ${({ padding }) => padding || '1rem'};
`

export const ArrowWrapper = styled.div<{ clickable: boolean }>`
  padding: 2px;

  ${({ clickable }) =>
    clickable
      ? css`
          :hover {
            cursor: pointer;
            opacity: 0.8;
          }
        `
      : null}
`

export const ErrorText = styled(Text)<{ severity?: 0 | 1 | 2 | 3 | 4 }>`
  color: ${({ theme, severity }) =>
    severity === 3 || severity === 4
      ? theme.colors.failure
      : severity === 2
      ? theme.colors.warning
      : severity === 1
      ? theme.colors.text
      : theme.colors.success};
`

export const StyledBalanceMaxMini = styled.button`
  height: 22px;
  width: 22px;
  background-color: ${({ theme }) => theme.colors.background};
  border: none;
  border-radius: 50%;
  padding: 0.2rem;
  font-size: 0.875rem;
  font-weight: 400;
  margin-left: 0.4rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  justify-content: center;
  align-items: center;
  float: right;

  :hover {
    background-color: ${({ theme }) => theme.colors.dropdown};
  }
  :focus {
    background-color: ${({ theme }) => theme.colors.dropdown};
    outline: none;
  }
`

export const TruncatedText = styled(Text).attrs({ ellipsis: true })`
  width: 220px;
`

const SwapCallbackErrorInner = styled.div`
  background-color: ${({ theme }) => `${theme.colors.failure}33`};
  border-radius: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.825rem;
  width: 100%;
  padding: 3rem 1.25rem 1rem 1rem;
  margin-top: -2rem;
  color: ${({ theme }) => theme.colors.failure};
  z-index: -1;
  p {
    padding: 0;
    margin: 0;
    font-weight: 500;
  }
`

const SwapCallbackErrorInnerAlertTriangle = styled.div`
  background-color: ${({ theme }) => `${theme.colors.failure}33`};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 12px;
  min-width: 48px;
  height: 48px;
`

export function SwapCallbackError({ error }: { error: string }) {
  return (
    <SwapCallbackErrorInner>
      <SwapCallbackErrorInnerAlertTriangle>
        <ErrorIcon width="24px" />
      </SwapCallbackErrorInnerAlertTriangle>
      <p>{error}</p>
    </SwapCallbackErrorInner>
  )
}

export const SwapShowAcceptChanges = styled(AutoColumn)`
  background-color: ${({ theme }) => `${theme.colors.warning}33`};
  padding: 0.5rem;
  border-radius: 12px;
  margin-top: 8px;
`

export const StyledSwapPageGrid = styled(Grid)<{showSettings?: boolean}>`
  grid-template-columns: 100%;
  align-content: start;
  justify-items: center;
  margin-top: 16px;
  margin-bottom: 36px;
  padding-bottom: ${({showSettings}) => showSettings ? '24px' : 0};
  
  ${({ theme }) => theme.mediaQueries.md} {
    grid-template-columns: 50% 50%;
    align-content: center;
    align-items: start;
    padding-bottom: 0;
  }
  ${({ theme }) => theme.mediaQueries.xl} {
    grid-template-columns: 60% 40%;
  }
  ${({ theme }) => theme.mediaQueries.sm} {
    margin-top: 15px;
  }
  
  @media screen and (max-width: 330px) {
    margin-bottom: 46px;
  }
`

export const StyledSwapPageChartCard = styled(ChartCard)`
  display: none;
  ${({ theme }) => theme.mediaQueries.md} {
    display: block;
  }
`
