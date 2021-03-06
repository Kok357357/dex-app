import React, { useCallback, useState } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { Card, Flex, Text, Skeleton, useMatchBreakpoints, CalculatorIcon, useModal } from '@pancakeswap/uikit'
import { DeserializedFarm } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import { BASE_ADD_LIQUIDITY_URL } from 'config'
import { getAddress } from 'utils/addressHelpers'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import RoiCalculatorModal from 'components/RoiCalculatorModal'
import CardHeading from './CardHeading'
import ApyButton from './ApyButton'
import { useWidth } from '../../../../hooks/useWidth'
import useTheme from '../../../../hooks/useTheme'
import { getBalanceAmount, getBalanceNumber } from '../../../../utils/formatBalance'
import { useFarmUser } from '../../../../state/farms/hooks'
import { BIG_TEN } from '../../../../utils/bigNumber'
import { getDisplayApr } from '../../hooks/getDisplayApr'

export interface FarmWithStakedValue extends DeserializedFarm {
  apr?: number
  lpRewardsApr?: number
  liquidity?: BigNumber
}

const StyledCard = styled(Card)<{ isActive?: boolean }>`
  align-self: baseline;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 2px solid ${({theme}) => theme.colors.backgroundAlt};
  background-color: ${({ isActive , theme }) => theme.colors.backgroundAlt};;

  &:hover {
    // background: ${({ theme }) => theme.colors.primary};
    transform: translateY(-5px);
    box-shadow: 0px 5px 12px rgb(126 142 177 / 20%);
    border-color: ${({ theme }) => theme.colors.primary};
        
    h2 {
      color: ${({ theme }) => theme.colors.primaryButtonText };
    }
  }
`

const FarmCardInnerContainer = styled(Flex)`
  flex-direction: column;
  justify-content: space-around;
  padding: 12px 16px;
`

const StyledCardSummary = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-column-gap: 34px;
  grid-row-gap: 26px;
  padding-top: 10px;
  margin-top: 10px;
  
  @media screen and (max-width: 1024px) {
    grid-column-gap: 26px;
  }

  @media screen and (max-width: 567px) {
    grid-column-gap: 26px;
    grid-template-columns: 1fr 1fr;
  }

`

interface FarmCardProps {
  farm: FarmWithStakedValue
  displayApr: string
  removed: boolean
  cakePrice?: BigNumber
  account?: string
  onClick?: () => void
  isCardActive?: boolean
}

const FarmCard: React.FC<FarmCardProps> = ({
  farm,
  displayApr,
  removed,
  cakePrice,
  account,
  onClick,
  isCardActive,
}) => {
  const { t } = useTranslation()
  const width = useWidth()
  const { theme } = useTheme()
  const { stakedBalance, tokenBalance } = useFarmUser(farm.pid)

  const totalValueFormatted =
    farm.liquidity && farm.liquidity.gt(0)
      ? `$${farm.liquidity.toNumber().toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : ''

  const lpLabel = farm.lpSymbol && farm.lpSymbol.toUpperCase().replace('ECO', 'ECO')
  const earnLabel = farm.dual ? farm.dual.earnLabel : t('ECO + Fees')

  const liquidityUrlPathParts = getLiquidityUrlPathParts({
    quoteTokenAddress: farm.quoteToken.address,
    tokenAddress: farm.token.address,
  })
  const addLiquidityUrl = `${BASE_ADD_LIQUIDITY_URL}/${liquidityUrlPathParts}`
  const lpAddress = getAddress(farm.lpAddresses)
  const liquidity = getBalanceNumber(new BigNumber(farm.liquidity), 0).toFixed(4)
  const liquidityNumber = !Number.isNaN(Number(liquidity)) ? liquidity : '0';
  const poolShare = parseFloat(stakedBalance.div(farm.totalStakedTokenInLp).div(BIG_TEN.pow(Number(farm?.token?.decimals) - 2)).toFixed(2))

  const displayBalance = useCallback(() => {
    const stakedBalanceBigNumber = getBalanceAmount(stakedBalance)
    if (stakedBalanceBigNumber.gt(0) && stakedBalanceBigNumber.lt(0.0000001)) {
      return '<0.0000001'
    }
    if (stakedBalanceBigNumber.gt(0)) {
      return stakedBalanceBigNumber.toFixed(8, BigNumber.ROUND_DOWN)
    }
    return stakedBalanceBigNumber.toFixed(3, BigNumber.ROUND_DOWN)
  }, [stakedBalance])

  const [onPresentROICaculator] = useModal(
    <RoiCalculatorModal
      linkLabel={t('Get %symbol%', { symbol: lpLabel })}
      stakingTokenBalance={stakedBalance.plus(tokenBalance)}
      stakingTokenSymbol={farm.lpSymbol}
      stakingTokenPrice={cakePrice.toNumber()}
      earningTokenPrice={cakePrice.toNumber()}
      apr={farm.apr}
      multiplier={farm.multiplier}
      displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
      linkHref={addLiquidityUrl}
      isFarm
    />,
  )

  const handleClick = (e) => {
    e.stopPropagation();
    onPresentROICaculator();
  }

  return (
    <StyledCard isActive={isCardActive} onClick={onClick}>
      <FarmCardInnerContainer>
        <Flex justifyContent="space-between">
          <CardHeading
            lpLabel={lpLabel.replace('LP', '')}
            multiplier={farm.multiplier}
            isCommunityFarm={farm.isCommunity}
            token={farm.token}
            quoteToken={farm.quoteToken}
            isCardActive={isCardActive}
          />
          <Flex onClick={(e) => handleClick(e)}>
            <CalculatorIcon width="30px" color={theme.colors.primary}/>
          </Flex>
        </Flex>
        <StyledCardSummary>
          <Flex justifyContent="flex-start" flexDirection="column">
            <Text fontSize="14px" fontWeight="400">{t('Daily ROI')}</Text>
            <Text fontSize="18px" fontWeight="700" color={theme.colors.purple}>2.53%</Text>
          </Flex>
          <Flex justifyContent="flex-start" flexDirection="column">
            <Text fontSize="14px" fontWeight="400">{t('Liquidity')}</Text>
            <Text fontSize="18px" fontWeight="700" color={theme.colors.green}>${liquidityNumber || 0}</Text>
          </Flex>
          <Flex justifyContent="flex-start" flexDirection="column">
            <Text fontSize="14px" fontWeight="400">{t('Rewards')}</Text>
            <Text fontSize="18px" fontWeight="700" color={theme.colors.yellow}>
              {parseFloat(getBalanceNumber(new BigNumber(farm.userData.earnings)).toFixed(4))} ECO
            </Text>
          </Flex>
          <Flex justifyContent="flex-start" flexDirection="column">
            <Text fontSize="14px" fontWeight="400">{t('APR')}</Text>
            {!removed && (
              <Text bold style={{ display: 'flex', alignItems: 'center' }}>
                {(farm.apr || farm.apr === 0) ? (
                  <ApyButton
                    variant="text-and-button"
                    pid={farm.pid}
                    lpSymbol={farm.lpSymbol}
                    multiplier={farm.multiplier}
                    lpLabel={lpLabel}
                    addLiquidityUrl={addLiquidityUrl}
                    cakePrice={cakePrice}
                    apr={farm.apr}
                    displayApr={displayApr}
                  />
                ) : (
                  <Skeleton height={24} width={80} />
                )}
              </Text>
            )}
          </Flex>
          <Flex justifyContent="flex-start" flexDirection="column">
            <Text fontSize="14px" fontWeight="400">{t('Staked')}</Text>
            <Text fontSize="18px" fontWeight="700" color={theme.colors.green}>{Number(displayBalance()).toFixed(4)} LP</Text>
          </Flex>
          <Flex justifyContent="flex-start" flexDirection="column">
            <Text fontSize="14px" fontWeight="400">{t('Share')}</Text>
            <Text fontSize="18px" fontWeight="700" color={theme.colors.yellow}>{poolShare || '0.00'}%</Text>
          </Flex>
        </StyledCardSummary>
      </FarmCardInnerContainer>
    </StyledCard>
  )
}

export default FarmCard
