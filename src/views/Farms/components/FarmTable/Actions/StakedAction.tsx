import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { Button, useModal, IconButton, AddIcon, MinusIcon, Skeleton, Text, Heading, Flex } from '@pancakeswap/uikit'
import { BigNumber } from 'bignumber.js'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Balance from 'components/Balance'
import { useWeb3React } from '@web3-react/core'
import { useFarmFromPid, useFarmUser, useLpTokenPrice, usePriceCakeBusd } from 'state/farms/hooks'
import { fetchFarmUserDataAsync, setActiveBodyType } from 'state/farms'
import { FarmWithStakedValue } from 'views/Farms/components/FarmCard/FarmCard'
import { useTranslation } from 'contexts/Localization'
import { useERC20 } from 'hooks/useContract'
import { BASE_ADD_LIQUIDITY_URL } from 'config'
import { useAppDispatch } from 'state'
import { getAddress } from 'utils/addressHelpers'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import { getBalanceAmount, getBalanceNumber, getFullDisplayBalance } from 'utils/formatBalance'
import useUnstakeFarms from '../../../hooks/useUnstakeFarms'
import DepositModal from '../../DepositModal'
import WithdrawModal from '../../WithdrawModal'
import useStakeFarms from '../../../hooks/useStakeFarms'
import useApproveFarm from '../../../hooks/useApproveFarm'
import { ActionContainer, ActionTitles, ActionContent } from './styles'
import { useWidth } from '../../../../../hooks/useWidth'

const IconButtonWrapper = styled.div`
  display: flex;
`

interface StackedActionProps extends FarmWithStakedValue {
  userDataReady: boolean
  lpLabel?: string
  displayApr?: string
  location?: any
  isCard?: boolean
  contentType?: string
}

const Staked: React.FunctionComponent<StackedActionProps> = ({
  pid,
  apr,
  multiplier,
  lpSymbol,
  lpLabel,
  lpAddresses,
  quoteToken,
  token,
  userDataReady,
  displayApr,
  location,
  isCard,
  contentType
}) => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const [requestedApproval, setRequestedApproval] = useState(false)
  const { allowance, tokenBalance, stakedBalance } = useFarmUser(pid)
  const { onStake } = useStakeFarms(pid)
  const { onUnstake } = useUnstakeFarms(pid)
  // TODO: Was not able to get the location when in modal due to context
  // const location = useLocation()
  const lpPrice = useLpTokenPrice(lpSymbol)
  const cakePrice = usePriceCakeBusd()
  const width = useWidth()
  const farm = useFarmFromPid(pid)

  const isApproved = account && allowance && allowance.isGreaterThan(0)

  const lpAddress = getAddress(lpAddresses)
  const liquidityUrlPathParts = getLiquidityUrlPathParts({
    quoteTokenAddress: quoteToken.address,
    tokenAddress: token.address,
  })
  const addLiquidityUrl = `${BASE_ADD_LIQUIDITY_URL}/${liquidityUrlPathParts}`

  const handleStake = async (amount: string) => {
    await onStake(amount)
    dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
  }

  const handleUnstake = async (amount: string) => {
    await onUnstake(amount)
    dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
  }

  const displayBalance = useCallback(() => {
    const stakedBalanceBigNumber = getBalanceAmount(stakedBalance)
    if (stakedBalanceBigNumber.gt(0) && stakedBalanceBigNumber.lt(0.0000001)) {
      return stakedBalanceBigNumber.toFixed(10, BigNumber.ROUND_DOWN)
    }
    if (stakedBalanceBigNumber.gt(0) && stakedBalanceBigNumber.lt(0.0001)) {
      return getFullDisplayBalance(stakedBalance).toLocaleString()
    }
    return stakedBalanceBigNumber.toFixed(3, BigNumber.ROUND_DOWN)
  }, [stakedBalance])

  const [onPresentDeposit] = useModal(
    <DepositModal
      max={tokenBalance}
      lpPrice={lpPrice}
      lpLabel={lpLabel}
      apr={apr}
      displayApr={displayApr}
      stakedBalance={stakedBalance}
      onConfirm={handleStake}
      tokenName={lpSymbol}
      multiplier={multiplier}
      addLiquidityUrl={addLiquidityUrl}
      cakePrice={cakePrice}
      tokens={[farm.token, pid === 0 ? null : farm.quoteToken]}
      isPopUp={width < 481}
    />,
    true,
    false,
    'farm-stake-deposit-modal',
    width < 481
  )
  
  const [onPresentWithdraw] = useModal(
    <WithdrawModal
      max={stakedBalance}
      onConfirm={handleUnstake}
      tokenName={lpSymbol}
      tokens={[farm.token, pid === 0 ? null : farm.quoteToken]}
      isPopUp={width < 481} />,
    true,
    false,
    'farm-unstake-withdraw-modal',
    width < 481
  )
  const lpContract = useERC20(lpAddress)
  const dispatch = useAppDispatch()
  const { onApprove } = useApproveFarm(lpContract)

  const handleApprove = useCallback(async () => {
    try {
      setRequestedApproval(true)
      await onApprove()
      dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))

      setRequestedApproval(false)
    } catch (e) {
      console.error(e)
    }
  }, [onApprove, dispatch, account, pid])

  const renderDepositCard = () => {
    return (
      <DepositModal
        max={tokenBalance}
        lpPrice={lpPrice}
        lpLabel={lpLabel}
        apr={apr}
        displayApr={displayApr}
        stakedBalance={stakedBalance}
        onConfirm={handleStake}
        tokenName={lpSymbol}
        multiplier={multiplier}
        addLiquidityUrl={addLiquidityUrl}
        cakePrice={cakePrice}
        isCard={isCard}
        tokens={[farm.token, pid === 0 ? null : farm.quoteToken]}
      />
    )
  }

  const renderWithdrawCard = () => {
    return (
      <WithdrawModal max={stakedBalance} onConfirm={handleUnstake} tokenName={lpSymbol} isPopUp={width < 481} tokens={[farm.token, pid === 0 ? null : farm.quoteToken]} isCard />
    )
  }

  const renderContent = () => {
    if (contentType === "deposit") {
      return renderDepositCard()
    }

    return renderWithdrawCard()
  }

  if (!account) {
    return (
      <>
        {isCard && renderContent()}
        <ActionContainer>
          <ActionContent>
            <Flex marginTop="12px" width="100%">
              <ConnectWalletButton width="100%" />
            </Flex>
          </ActionContent>
        </ActionContainer>
      </>
    )
  }

  if (isApproved) {
    if (stakedBalance.gt(0)) {
      if (isCard) {
        return renderContent()
      }

      return (
        <>
          {isCard && renderContent()}
          <ActionContainer>
            <ActionContent>
              <Flex width="100%" justifyContent="space-evenly">
                <Button onClick={onPresentWithdraw} variant="primary" mr="6px" width="100%">
                  {t("Unstake")}
                </Button>
                <Button
                  variant="primary"
                  onClick={onPresentDeposit}
                  width="100%"
                  disabled={['history', 'archived'].some((item) => location.pathname.includes(item))}
                >
                  {t("Stake")}
                </Button>
              </Flex>
            </ActionContent>
          </ActionContainer>
        </>
      )
    }

    if (isCard) {
      return renderContent()
    }

    return (
      <>
        {isCard && renderContent()}
        <ActionContainer>
          <ActionContent>
            <Button
              width="100%"
              onClick={onPresentDeposit}
              variant="primary"
              disabled={['history', 'archived'].some((item) => location.pathname.includes(item))}
            >
              {t('Stake LP')}
            </Button>
          </ActionContent>
        </ActionContainer>
      </>
    )
  }

  if (!userDataReady) {
    return (
      <>
        {isCard && renderContent()}
        <ActionContainer>
          <ActionContent>
            <Skeleton width="100%" height="45px" marginBottom="8px" marginTop="12px" />
          </ActionContent>
        </ActionContainer>
      </>
    )
  }

  return (
    <>
      {isCard && renderContent()}
      <ActionContainer>
        <ActionContent>
          <Button width="100%" disabled={requestedApproval} onClick={handleApprove} variant="subtle" mt="12px">
            {t('Enable')}
          </Button>
        </ActionContent>
      </ActionContainer>
    </>
  )
}

export default Staked
