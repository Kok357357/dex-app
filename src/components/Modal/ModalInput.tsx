import React from 'react'
import styled from 'styled-components'
import { Text, Button, Input, InputProps, Flex, Link } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { parseUnits } from 'ethers/lib/utils'
import { formatBigNumber } from 'utils/formatBalance'
import { Token } from '@pancakeswap/sdk'
import { useWidth } from '../../hooks/useWidth'
import { CurrencyLogo } from '../Logo'

interface ModalInputProps {
  max: string
  symbol: string
  onSelectMax?: () => void
  onChange: (e: React.FormEvent<HTMLInputElement>) => void
  placeholder?: string
  value: string
  addLiquidityUrl?: string
  inputTitle?: string
  decimals?: number
  tokens?: Token[]
}

const getBoxShadow = ({ isWarning = false, theme }) => {
  if (isWarning) {
    return theme.shadows.warning
  }

  return theme.shadows.inset
}

const StyledTokenInput = styled.div<InputProps>`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.input};
  border-radius: 5px;
  //box-shadow: ${getBoxShadow};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 16px 8px 0;
  width: 100%;
  margin-bottom: 12px;
`

const InputWrapper = styled(Flex)`
`

const StyledInput = styled(Input)`
  box-shadow: none;
  margin: 0 8px;
  padding: 0 8px;
  border: none;

  // ${({ theme }) => theme.mediaQueries.xs} {
  //   width: 80px;
  // }

  // ${({ theme }) => theme.mediaQueries.sm} {
  //   width: auto;
  // }
`

const StyledErrorMessage = styled(Text)`
  position: absolute;
  // bottom: -22px;
  a {
    display: inline;
  }
`

const ModalInput: React.FC<ModalInputProps> = ({
  max,
  symbol,
  onChange,
  onSelectMax,
  value,
  placeholder,
  addLiquidityUrl,
  inputTitle,
  decimals = 18,
  tokens
}) => {
  const { t } = useTranslation()
  const width = useWidth()
  const isBalanceZero = max === '0' || !max

  const displayBalance = (balance: string) => {
    if (isBalanceZero) {
      return '0'
    }

    const balanceUnits = parseUnits(balance, decimals)
    return formatBigNumber(balanceUnits, decimals, decimals)
  }

  return (
    <div style={{ position: 'relative' }}>
      <Flex justifyContent="space-between" mb="12px">
        <Text fontSize="14px" textAlign="left">
          {inputTitle}
        </Text>
        <Text fontSize="14px" textAlign="right">{t('Balance: %balance%', { balance: parseFloat(Number(displayBalance(max)).toFixed(4)) })}</Text>
      </Flex>
      <StyledTokenInput isWarning={isBalanceZero}>
        <InputWrapper alignItems="center" justifyContent="space-between">
          <StyledInput
            pattern={`^[0-9]*[.,]?[0-9]{0,${decimals}}$`}
            inputMode="decimal"
            step="any"
            min="0"
            onChange={onChange}
            placeholder="0"
            value={value}
            width="100%"
          />
          <Flex alignItems="center" justifyContent="end">
            <Button scale="sm" variant="text" onClick={onSelectMax} mr="8px">
              {t('Max')}
            </Button>
            <Flex flexDirection="column">
              <Flex mb={tokens[1] !== null ? '-8px' : '0px'} minWidth="28px">
                <CurrencyLogo currency={tokens[0]} size="28px"/>
              </Flex>
              {tokens[1] !== null && <CurrencyLogo currency={tokens[1]} size="28px" />}
            </Flex>
          </Flex>
        </InputWrapper>
      </StyledTokenInput>
      {isBalanceZero && (
        <StyledErrorMessage fontSize="14px" color="failure">
          {t('No tokens to stake')}:{' '}
          <Link fontSize="14px" bold={false} href={addLiquidityUrl} external color="failure">
            {t('Get %symbol%', { symbol })}
          </Link>
        </StyledErrorMessage>
      )}
    </div>
  )
}

export default ModalInput
