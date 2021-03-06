import React, { useState } from 'react'
import { Text, Button, Input, Flex, Box } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { useUserSlippageTolerance, useUserTransactionTTL } from 'state/user/hooks'
import styled from 'styled-components'
import QuestionHelper from '../../QuestionHelper'
import useTheme from '../../../hooks/useTheme'

enum SlippageError {
  InvalidInput = 'InvalidInput',
  RiskyLow = 'RiskyLow',
  RiskyHigh = 'RiskyHigh',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

const StyledPercentText = styled(Text)`
  @media screen and (max-width: 360px) {
    margin: 0 4px;
  }
`

const StyledInputBox = styled(Box)`
  @media screen and (max-width: 360px) {
    width: 60px;
    margin-right: 0;

    ${Input} {
      padding: 0 8px;
    }
  }
`

const StyledSlippageButton = styled(Button)`
  @media screen and (max-width: 360px) {
    margin: 4px 0 4px 4px;
  }
`

const SlippageTabs = () => {
  const [userSlippageTolerance, setUserSlippageTolerance] = useUserSlippageTolerance()
  const [ttl, setTtl] = useUserTransactionTTL()
  const [slippageInput, setSlippageInput] = useState('')
  const [deadlineInput, setDeadlineInput] = useState('')

  const { t } = useTranslation()

  const { theme } = useTheme()

  const slippageInputIsValid =
    slippageInput === '' || (userSlippageTolerance / 100).toFixed(2) === Number.parseFloat(slippageInput).toFixed(2)
  const deadlineInputIsValid = deadlineInput === '' || (ttl / 60).toString() === deadlineInput

  let slippageError: SlippageError | undefined
  if (slippageInput !== '' && !slippageInputIsValid) {
    slippageError = SlippageError.InvalidInput
  } else if (slippageInputIsValid && userSlippageTolerance < 50) {
    slippageError = SlippageError.RiskyLow
  } else if (slippageInputIsValid && userSlippageTolerance > 500) {
    slippageError = SlippageError.RiskyHigh
  } else {
    slippageError = undefined
  }

  let deadlineError: DeadlineError | undefined
  if (deadlineInput !== '' && !deadlineInputIsValid) {
    deadlineError = DeadlineError.InvalidInput
  } else {
    deadlineError = undefined
  }

  const parseCustomSlippage = (value: string) => {
    setSlippageInput(value)

    try {
      const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString())
      if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
        setUserSlippageTolerance(valueAsIntFromRoundedFloat)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const parseCustomDeadline = (value: string) => {
    setDeadlineInput(value)

    try {
      const valueAsInt: number = Number.parseInt(value) * 60
      if (!Number.isNaN(valueAsInt) && valueAsInt > 0) {
        setTtl(valueAsInt)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Flex flexDirection="column">
      <Flex flexDirection="column" mb="24px" fontSize="14px">
        <Flex mb="12px">
          <Text small>{t('Slippage Tolerance')}</Text>
          <QuestionHelper
            text={t(
              'Setting a high slippage tolerance can help transactions succeed, but you may not get such a good price. Use with caution.',
            )}
            placement="top-start"
            ml="4px"
          />
        </Flex>
        <Flex
          flexWrap="wrap"
          borderRadius="8px"
          alignItems="center"
          justifyContent="space-between"
          background={theme.colors.input}
        >
          <Flex>
            <StyledSlippageButton
              m="4px"
              scale="xs"
              ml="16px"
              onClick={() => {
                setSlippageInput('')
                setUserSlippageTolerance(10)
              }}
              variant={userSlippageTolerance === 10 ? 'primary' : 'tertiary'}
            >
              0.1%
            </StyledSlippageButton>
            <StyledSlippageButton
              m="4px"
              scale="xs"
              onClick={() => {
                setSlippageInput('')
                setUserSlippageTolerance(50)
              }}
              variant={userSlippageTolerance === 50 ? 'primary' : 'tertiary'}
            >
              0.5%
            </StyledSlippageButton>
            <StyledSlippageButton
              m="4px"
              scale="xs"
              onClick={() => {
                setSlippageInput('')
                setUserSlippageTolerance(100)
              }}
              variant={userSlippageTolerance === 100 ? 'primary' : 'tertiary'}
            >
              1.0%
            </StyledSlippageButton>
          </Flex>
          <Flex alignItems="center">
            <StyledInputBox width="76px" m="4px" ml="0">
              <Input
                fontSize="14px"
                scale="md"
                placeholder={(userSlippageTolerance / 100).toFixed(2)}
                value={slippageInput}
                onBlur={() => {
                  parseCustomSlippage((userSlippageTolerance / 100).toFixed(2))
                }}
                onChange={(e) => parseCustomSlippage(e.target.value)}
                isWarning={!slippageInputIsValid}
                isSuccess={![10, 50, 100].includes(userSlippageTolerance)}
                noBorder
              />
            </StyledInputBox>
            <StyledPercentText color="text" bold ml="2px" mr="8px" small>
              %
            </StyledPercentText>
          </Flex>
        </Flex>
        {!!slippageError && (
          <Text small color={slippageError === SlippageError.InvalidInput ? 'red' : '#F3841E'} mt="8px">
            {slippageError === SlippageError.InvalidInput
              ? t('Enter a valid slippage percentage')
              : slippageError === SlippageError.RiskyLow
              ? t('Your transaction may fail')
              : t('Your transaction may be frontrun')}
          </Text>
        )}
      </Flex>
      <Flex alignItems="start" mb="24px" flexDirection="column">
        <Flex alignItems="center" mb="12px">
          <Text small>{t('Tx deadline (mins)')}</Text>
          <QuestionHelper
            text={t('Your transaction will revert if it is left confirming for longer than this time.')}
            placement="top-start"
            ml="4px"
          />
        </Flex>
        <Flex
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          background={theme.colors.input}
          borderRadius="8px"
        >
          <Box py="4px" fontSize="14px">
            <Input
              scale="md"
              height="100%"
              fontSize="14px"
              color={deadlineError ? 'red' : undefined}
              onBlur={() => {
                parseCustomDeadline((ttl / 60).toString())
              }}
              placeholder={(ttl / 60).toString()}
              value={deadlineInput}
              onChange={(e) => parseCustomDeadline(e.target.value)}
              noBorder
            />
          </Box>
          <Text color="text" bold ml="2px" mr="8px" small>
            minutes
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default SlippageTabs
