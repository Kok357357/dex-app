import React, { useState } from 'react'
import styled from 'styled-components'
import { Text, PancakeToggle, Toggle, Flex, Modal, InjectedModalProps, ThemeSwitcher } from '@pancakeswap/uikit'
import {
  useAudioModeManager,
  useExpertModeManager,
  useUserExpertModeAcknowledgementShow,
  useUserSingleHopOnly,
} from 'state/user/hooks'
import { useTranslation } from 'contexts/Localization'
import { useSwapActionHandlers } from 'state/swap/hooks'
import useTheme from 'hooks/useTheme'
import QuestionHelper from '../../QuestionHelper'
import TransactionSettings from './TransactionSettings'
import ExpertModal from './ExpertModal'
import GasSettings from './GasSettings'

// TODO: Temporary. Once uikit is merged with this style change, this can be removed.
const PancakeToggleWrapper = styled.div`
  .pancakes {
    position: absolute;
  }
`

const ScrollableContainer = styled(Flex)<{noModal?: boolean}>`
  flex-direction: column;
  max-height: ${({noModal}) => noModal ? 'none' : '450px'};
  ${({ theme }) => theme.mediaQueries.sm} {
    max-height: none;
  }
`

const StyledModal = styled(Modal)`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`

const SettingsModal: React.FC<InjectedModalProps> = ({ onDismiss, noModal, isPopUp }) => {
  const [showConfirmExpertModal, setShowConfirmExpertModal] = useState(false)
  const [showExpertModeAcknowledgement, setShowExpertModeAcknowledgement] = useUserExpertModeAcknowledgementShow()
  const [expertMode, toggleExpertMode] = useExpertModeManager()
  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly()
  const [audioPlay, toggleSetAudioMode] = useAudioModeManager()
  const { onChangeRecipient } = useSwapActionHandlers()

  const { t } = useTranslation()
  const { theme, isDark, toggleTheme } = useTheme()

  if (showConfirmExpertModal) {
    return (
      <ExpertModal
        setShowConfirmExpertModal={setShowConfirmExpertModal}
        onDismiss={onDismiss}
        setShowExpertModeAcknowledgement={setShowExpertModeAcknowledgement}
        noModal={noModal}
      />
    )
  }

  const handleExpertModeToggle = () => {
    if (expertMode) {
      onChangeRecipient(null)
      toggleExpertMode()
    } else if (!showExpertModeAcknowledgement) {
      onChangeRecipient(null)
      toggleExpertMode()
    } else {
      setShowConfirmExpertModal(true)
    }
  }

  const renderModalBody = () => {
    return (
      <ScrollableContainer noModal={noModal}>
        <Flex pb="24px" flexDirection="column">
          <GasSettings />
        </Flex>
        <Flex flexDirection="column">
          <TransactionSettings />
        </Flex>
        <Flex justifyContent="space-between" alignItems="center" mb="24px">
          <Flex alignItems="center">
            <Text small>{t('Expert Mode')}</Text>
            <QuestionHelper
              text={t('Bypasses confirmation modals and allows high slippage trades. Use at your own risk.')}
              placement="top-start"
              ml="4px"
            />
          </Flex>
          <Toggle id="toggle-expert-mode-button" scale="sm" checked={expertMode} onChange={handleExpertModeToggle} />
        </Flex>
        <Flex justifyContent="space-between" alignItems="center" mb="24px">
          <Flex alignItems="center">
            <Text small>{t('Disable Multihops')}</Text>
            <QuestionHelper text={t('Restricts swaps to direct pairs only.')} placement="top-start" ml="4px" />
          </Flex>
          <Toggle
            id="toggle-disable-multihop-button"
            checked={singleHopOnly}
            scale="sm"
            onChange={() => {
              setSingleHopOnly(!singleHopOnly)
            }}
          />
        </Flex>
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center">
            <Text small>{t('Flippy sounds')}</Text>
            <QuestionHelper
              text={t('Fun sounds to make a truly immersive pancake-flipping trading experience')}
              placement="top-start"
              ml="4px"
            />
          </Flex>
          <Toggle
            id="toggle-disable-multihop-button"
            checked={audioPlay}
            scale="sm"
            onChange={() => {
              toggleSetAudioMode()
            }}
          />
          {/* <PancakeToggleWrapper> */}
          {/*  <PancakeToggle checked={audioPlay} onChange={toggleSetAudioMode} scale="md" /> */}
          {/* </PancakeToggleWrapper> */}
        </Flex>
      </ScrollableContainer>
    )
  }

  if (noModal) {
    return renderModalBody()
  }

  return (
    <StyledModal
      title={t('Settings')}
      onDismiss={onDismiss}
      style={{ maxWidth: isPopUp ? '480px' : '425px' }}
      isPopUp={isPopUp}
    >
      {renderModalBody()}
    </StyledModal>
  )
}

export default SettingsModal
