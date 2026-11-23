import { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { ThemeType } from '../../theme';
import type { BillingState } from '../../hooks/useBilling';
import type { UserProfileDTO, UserProfileUpdatePayload } from '../../utils/profileSync';
import { StoreLocationPickerModal } from '../merchant/components/modals/StoreLocationPickerModal';
import { dispatchBackButton } from '../../utils/backButton';

import { ProfileTopBar } from './components/ProfileTopBar';
import { ProfileMainView } from './components/ProfileMainView';
import { PrivacySubView } from './components/PrivacySubView';
import { AddressSubView } from './components/AddressSubView';
import { ProfileEditSubView } from './components/ProfileEditSubView';
import { NotificationSubView } from './components/NotificationSubView';
import { ConfirmServiceModal } from './components/ConfirmServiceModal';
import { DeleteAccountModal } from './components/DeleteAccountModal';
import { useProfileData } from './components/useProfileData';
import type { ProfileViewMode } from './components/types';
import './ProfilePage.css';

interface ProfilePageProps {
  theme: ThemeType;
  billingState: BillingState;
  userEmail?: string;
  userProfile?: UserProfileDTO | null;
  onUpdateProfile?: (patch: UserProfileUpdatePayload) => Promise<UserProfileDTO>;
  onDeleteAccount?: () => Promise<void>;
  mode: 'light' | 'dark';
  onModeChange: (mode: 'light' | 'dark') => void;
  onBack: () => void;
  onDisconnect: () => void;
  socket?: any;
  isMobileView?: boolean;
}

export function ProfilePage({
  theme,
  billingState,
  userEmail,
  userProfile,
  onUpdateProfile,
  onDeleteAccount,
  mode,
  onModeChange,
  onBack,
  onDisconnect,
  socket,
  isMobileView,
}: ProfilePageProps) {
  const [viewMode, setViewMode] = useState<ProfileViewMode>('main');

  const {
    // Profile info
    emailValue,
    phoneValue,
    handlePhoneInputChange,
    isPhoneVerified,
    nameValue,
    setNameValue,
    nicknameValue,
    setNicknameValue,
    avatarUrl,
    fileInputRef,
    handleEditPhotoClick,
    handleFileChange,
    handleRemovePhoto,
    userInitial,
    handleOpenProfileEdit,
    handleSaveProfile,
    isSaving,

    // Address
    addressForm,
    setAddressForm,
    isLocationModalOpen,
    setIsLocationModalOpen,
    handleOpenAddressEdit,
    handleConfirmLocation,
    handleSaveAddress,

    // Subscriptions & Tokens
    currentTier,
    isUnlimited,
    tokenPercent,
    balanceModal,
    setBalanceModal,
    handleDevMockSubscribe,
    handleDevMockTopup,

    // Privacy, Notifications & Cache
    trainAiOptIn,
    handleToggleAiTraining,
    handleClearLocalCache,
    notificationPrefs,
    handleUpdateNotificationPrefs,

    // Account Deletion
    showDeleteModal,
    setShowDeleteModal,
    isDeleting,
    handleConfirmDeleteAccount,

    // Status Feedback
    statusFeedback,
  } = useProfileData({
    billingState,
    userEmail,
    userProfile,
    onUpdateProfile,
    onDeleteAccount,
    socket,
    onDisconnect,
    viewMode,
    setViewMode,
  });

  const handleBackClick = () => {
    if (dispatchBackButton()) return;
    if (viewMode !== 'main') {
      setViewMode('main');
    } else {
      onBack();
    }
  };

  const cssVariables = {
    '--ink': theme.ink,
    '--ink-soft': theme.inkSoft,
  } as React.CSSProperties;

  return (
    <div className="profile-page-container" style={{ ...cssVariables, background: theme.bg, minHeight: '100%' }}>
      {/* Top App Bar */}
      <ProfileTopBar
        theme={theme}
        viewMode={viewMode}
        mode={mode}
        onModeChange={onModeChange}
        onBackClick={handleBackClick}
      />

      {/* Main Body Container */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: `12px ${isMobileView ? 16 : 24}px 60px`,
          color: theme.ink,
        }}
      >
        <div
          style={{
            maxWidth: 520,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {statusFeedback && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 13,
                fontWeight: 600,
                background: statusFeedback.type === 'success' ? theme.statusSoft : theme.surface2,
                color: statusFeedback.type === 'success' ? theme.status : '#ef4444',
                border: `1px solid ${statusFeedback.type === 'success' ? theme.status : theme.border}`,
              }}
            >
              {statusFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span style={{ flex: 1 }}>{statusFeedback.text}</span>
            </div>
          )}

          {viewMode === 'main' && (
            <ProfileMainView
              theme={theme}
              emailValue={emailValue}
              userEmail={userEmail}
              currentTier={currentTier}
              tokenPercent={tokenPercent}
              isUnlimited={isUnlimited}
              onOpenProfile={handleOpenProfileEdit}
              onOpenAddress={handleOpenAddressEdit}
              onOpenNotification={() => setViewMode('notification')}
              onOpenPrivacy={() => setViewMode('privacy')}
              onDisconnect={onDisconnect}
            />
          )}

          {viewMode === 'profile' && (
            <ProfileEditSubView
              theme={theme}
              fileInputRef={fileInputRef}
              avatarUrl={avatarUrl}
              userInitial={userInitial}
              nameValue={nameValue}
              setNameValue={setNameValue}
              nicknameValue={nicknameValue}
              setNicknameValue={setNicknameValue}
              emailValue={emailValue}
              phoneValue={phoneValue}
              isPhoneVerified={isPhoneVerified}
              isSaving={isSaving}
              onFileChange={handleFileChange}
              onEditPhotoClick={handleEditPhotoClick}
              onRemovePhoto={handleRemovePhoto}
              onPhoneInputChange={handlePhoneInputChange}
              onSaveProfile={handleSaveProfile}
              onOpenDeleteModal={() => setShowDeleteModal(true)}
            />
          )}

          {viewMode === 'privacy' && (
            <PrivacySubView
              theme={theme}
              trainAiOptIn={trainAiOptIn}
              onToggleAiTraining={handleToggleAiTraining}
              onClearLocalCache={handleClearLocalCache}
            />
          )}

          {viewMode === 'notification' && (
            <NotificationSubView
              theme={theme}
              serverPrefs={notificationPrefs}
              onSavePreferences={handleUpdateNotificationPrefs}
            />
          )}

          {viewMode === 'address' && (
            <AddressSubView
              theme={theme}
              addressForm={addressForm}
              setAddressForm={setAddressForm}
              onSaveAddress={handleSaveAddress}
              onOpenLocationPicker={() => setIsLocationModalOpen(true)}
              isSaving={isSaving}
            />
          )}
        </div>
      </main>

      {/* Service Confirmation Modal */}
      <ConfirmServiceModal
        theme={theme}
        balanceModal={balanceModal}
        onClose={() => setBalanceModal(null)}
        onDevMockSubscribe={handleDevMockSubscribe}
        onDevMockTopup={handleDevMockTopup}
      />

      {/* Delete Account Confirmation Modal */}
      <DeleteAccountModal
        theme={theme}
        isOpen={showDeleteModal}
        isDeleting={isDeleting}
        onClose={() => setShowDeleteModal(false)}
        onConfirmDelete={handleConfirmDeleteAccount}
      />

      {/* Delivery Address Map Picker Modal */}
      <StoreLocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title="Set Delivery Address Pin"
        initialLat={addressForm.lat}
        initialLng={addressForm.lng}
        initialAddress={addressForm.streetAddress}
        onConfirmLocation={handleConfirmLocation}
        theme={theme}
        isMobileView={isMobileView}
      />
    </div>
  );
}
