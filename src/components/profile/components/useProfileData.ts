import { useState, useEffect, useRef } from 'react';
import type { BillingState } from '../../../hooks/useBilling';
import type { StoreLocationResult } from '../../merchant/components/modals/StoreLocationPickerModal';
import { registerBackHandler } from '../../../utils/backButton';
import { compressImageFile } from '../../../utils/imageCompressor';
import { getApiBaseUrl } from '../../../utils/platform';
import {
  clearProfileLocalCache,
  type UserNotificationPreferencesDTO,
  type UserProfileDTO,
  type UserProfileUpdatePayload,
} from '../../../utils/profileSync';
import type { AddressData, BalanceModalState, ProfileViewMode, StatusFeedback } from './types';

interface UseProfileDataParams {
  billingState: BillingState;
  userEmail?: string;
  userProfile?: UserProfileDTO | null;
  onUpdateProfile?: (patch: UserProfileUpdatePayload) => Promise<UserProfileDTO>;
  onDeleteAccount?: () => Promise<void>;
  socket?: any;
  onDisconnect: () => void;
  viewMode: ProfileViewMode;
  setViewMode: (mode: ProfileViewMode) => void;
}

function toAddressData(profile?: UserProfileDTO | null, fallbackName?: string, fallbackPhone?: string): AddressData {
  if (profile?.defaultAddress) {
    return {
      label: profile.defaultAddress.label === 'Rumah' ? 'Home' : (profile.defaultAddress.label || 'Home'),
      recipientName: profile.defaultAddress.recipientName || '',
      phone: profile.defaultAddress.phone || '',
      streetAddress: profile.defaultAddress.streetAddress || '',
      city: profile.defaultAddress.city || '',
      postalCode: profile.defaultAddress.postalCode,
      notes: profile.defaultAddress.notes || '',
      lat: profile.defaultAddress.lat,
      lng: profile.defaultAddress.lng,
    };
  }
  return {
    label: 'Home',
    recipientName: fallbackName || '',
    phone: fallbackPhone || '',
    streetAddress: '',
    city: '',
    notes: '',
  };
}

export function useProfileData({
  billingState,
  userEmail,
  userProfile,
  onUpdateProfile,
  onDeleteAccount,
  socket,
  onDisconnect,
  viewMode,
  setViewMode,
}: UseProfileDataParams) {
  const showFeedback = (type: 'success' | 'error' | 'info', text: string, ms: number = 3500) => {
    setStatusFeedback({ type, text });
    setTimeout(() => setStatusFeedback(null), ms);
  };

  // Profile Information
  const [emailValue, setEmailValue] = useState<string>(() => {
    return (
      userProfile?.email ||
      userEmail ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('sera_user_email') || localStorage.getItem('sera_saved_email') || ''
        : '')
    );
  });

  const [phoneValue, setPhoneValue] = useState<string>(() => {
    if (userProfile) return userProfile.phone || '';
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sera_user_phone') || localStorage.getItem('sera_customer_phone') || '';
    }
    return '';
  });

  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(() => Boolean(userProfile?.phoneVerified));

  const [nameValue, setNameValue] = useState<string>(() => {
    if (userProfile) return userProfile.fullName || '';
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sera_customer_name') || localStorage.getItem('sera_user_name') || '';
    }
    return '';
  });

  const [nicknameValue, setNicknameValue] = useState<string>(() => {
    if (userProfile) return userProfile.nickname || '';
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sera_user_nickname') || '';
    }
    return '';
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    if (userProfile !== undefined) return userProfile?.avatarUrl ?? null;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sera_user_avatar') || null;
    }
    return null;
  });

  const [trainAiOptIn, setTrainAiOptIn] = useState<boolean>(() => {
    if (userProfile) return userProfile.trainAiOptIn;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sera_train_ai_opt_in');
      return stored === null ? true : stored === 'true';
    }
    return true;
  });

  const getStoredAddress = (): AddressData => {
    if (userProfile) {
      return toAddressData(userProfile, userProfile.fullName, userProfile.phone);
    }
    if (typeof window === 'undefined') {
      return toAddressData(null);
    }
    let lat: number | undefined = undefined;
    let lng: number | undefined = undefined;
    const rawLat = localStorage.getItem('sera_customer_lat');
    const rawLng = localStorage.getItem('sera_customer_lng');
    if (rawLat && rawLng && !isNaN(parseFloat(rawLat)) && !isNaN(parseFloat(rawLng))) {
      lat = parseFloat(rawLat);
      lng = parseFloat(rawLng);
    }
    try {
      const raw = localStorage.getItem('sera_user_address_details');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...parsed,
          lat: parsed.lat !== undefined ? parsed.lat : lat,
          lng: parsed.lng !== undefined ? parsed.lng : lng,
        };
      }
    } catch {}
    return {
      label: 'Home',
      recipientName: localStorage.getItem('sera_customer_name') || localStorage.getItem('sera_user_name') || '',
      phone: localStorage.getItem('sera_user_phone') || localStorage.getItem('sera_customer_phone') || '',
      streetAddress: localStorage.getItem('sera_customer_address') || '',
      city: '',
      notes: '',
      lat,
      lng,
    };
  };

  const [addressForm, setAddressForm] = useState<AddressData>(getStoredAddress);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local form state whenever canonical server userProfile arrives/changes
  useEffect(() => {
    if (!userProfile) return;
    setEmailValue(userProfile.email || userEmail || '');
    setNameValue(userProfile.fullName || '');
    setNicknameValue(userProfile.nickname || '');
    setPhoneValue(userProfile.phone || '');
    setIsPhoneVerified(Boolean(userProfile.phoneVerified));
    setAvatarUrl(userProfile.avatarUrl ?? null);
    setTrainAiOptIn(userProfile.trainAiOptIn ?? true);
    setAddressForm(toAddressData(userProfile, userProfile.fullName, userProfile.phone));
  }, [userProfile, userEmail]);

  useEffect(() => {
    if (userEmail && !emailValue) {
      setEmailValue(userEmail);
    }
  }, [userEmail, emailValue]);

  const handlePhoneInputChange = (rawVal: string) => {
    const cleanNum = rawVal.replace(/\D/g, '');
    setPhoneValue(cleanNum);
    if (userProfile?.phoneVerified && cleanNum === userProfile.phone) {
      setIsPhoneVerified(true);
    } else {
      setIsPhoneVerified(false);
    }
  };

  const handleOpenAddressEdit = () => {
    setAddressForm(getStoredAddress());
    setViewMode('address');
  };

  const handleCancelAddressEdit = () => {
    setAddressForm(getStoredAddress());
    setIsLocationModalOpen(false);
    setViewMode('main');
  };

  const handleConfirmLocation = (result: StoreLocationResult) => {
    setAddressForm((prev) => ({
      ...prev,
      lat: result.lat,
      lng: result.lng,
      streetAddress: result.fullAddress ? result.fullAddress : prev.streetAddress,
      city: result.city ? result.city : prev.city,
    }));
    setIsLocationModalOpen(false);
  };

  const handleSaveAddress = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!onUpdateProfile) {
      showFeedback('error', 'Profile storage service is not ready yet.');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateProfile({ defaultAddress: addressForm });
      showFeedback('success', 'Delivery address saved permanently!');
      setViewMode('main');
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to save delivery address.');
    } finally {
      setIsSaving(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('error', 'Unsupported file format. Please select an image (JPG, PNG, WebP).', 3000);
      e.target.value = '';
      return;
    }

    const prevAvatar = avatarUrl;
    setIsSaving(true);
    try {
      const compressedDataUrl = await compressImageFile(file, {
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.85,
        cropSquare: true,
        mimeType: 'image/jpeg',
      });

      setAvatarUrl(compressedDataUrl);

      const apiUrl = getApiBaseUrl();
      const sessionId =
        userProfile?.userId ||
        (userEmail ? `email:${userEmail}` : null) ||
        (typeof window !== 'undefined' ? localStorage.getItem('sera_session_id') : null) ||
        'profile';

      const uploadRes = await fetch(`${apiUrl}/api/upload/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl: compressedDataUrl,
          filename: `avatar_${Date.now()}.jpg`,
          sessionId,
          subFolder: 'avatars',
        }),
      });
      const data = await uploadRes.json();
      if (!uploadRes.ok || !data?.success || !data?.url || String(data.url).startsWith('blob:')) {
        throw new Error(data?.error || 'Failed to upload profile photo to server.');
      }

      if (onUpdateProfile) {
        const saved = await onUpdateProfile({
          avatarUrl: data.url,
          avatarFileKey: data.fileKey || null,
        });
        setAvatarUrl(saved.avatarUrl ?? data.url);
      } else {
        setAvatarUrl(data.url);
      }

      showFeedback('success', 'Profile photo saved successfully!', 2500);
    } catch (err: any) {
      console.error('[useProfileData] Failed to update avatar image:', err);
      setAvatarUrl(prevAvatar);
      showFeedback('error', err?.message || 'Failed to upload and save profile photo.', 3500);
    } finally {
      setIsSaving(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    const prevAvatar = avatarUrl;
    setAvatarUrl(null);
    if (!onUpdateProfile) return;

    setIsSaving(true);
    try {
      await onUpdateProfile({ avatarUrl: null, avatarFileKey: null });
      showFeedback('info', 'Profile photo removed, reverted to initials.', 2500);
    } catch (err: any) {
      setAvatarUrl(prevAvatar);
      showFeedback('error', err?.message || 'Failed to remove profile photo.');
    } finally {
      setIsSaving(false);
    }
  };

  const userInitial = (
    nameValue.trim().charAt(0) ||
    nicknameValue.trim().charAt(0) ||
    (emailValue.trim() ? emailValue.trim().charAt(0) : '') ||
    'S'
  ).toUpperCase();

  // Subscriptions & Topup Feedback State
  const [selectedTopup, setSelectedTopup] = useState<number>(75000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<StatusFeedback>(null);

  const handleToggleAiTraining = async () => {
    const prevVal = trainAiOptIn;
    const nextVal = !trainAiOptIn;
    setTrainAiOptIn(nextVal);

    if (onUpdateProfile) {
      try {
        await onUpdateProfile({ trainAiOptIn: nextVal });
      } catch (err: any) {
        setTrainAiOptIn(prevVal);
        showFeedback('error', err?.message || 'Failed to save privacy preference.');
        return;
      }
    } else if (typeof window !== 'undefined') {
      localStorage.setItem('sera_train_ai_opt_in', String(nextVal));
    }

    showFeedback(
      'success',
      nextVal
        ? 'Preference saved: AI model improvement contribution enabled.'
        : 'Preference saved: Your chats are not used for model training.',
      3200
    );
  };

  const handleUpdateNotificationPrefs = async (nextPrefs: UserNotificationPreferencesDTO) => {
    if (!onUpdateProfile) return;
    try {
      await onUpdateProfile({ notificationPrefs: nextPrefs });
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to sync notification preferences.');
    }
  };

  const handleClearLocalCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sera_chat_messages');
      localStorage.removeItem('sera_active_session_cache');
      showFeedback('success', 'Local conversation cache cleared successfully.', 3200);
    }
  };

  // Account Deletion
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      if (onDeleteAccount) {
        await onDeleteAccount();
      } else {
        clearProfileLocalCache({ clearSavedEmail: true });
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sera_chat_messages');
        localStorage.removeItem('sera_active_session_cache');
      }
      setShowDeleteModal(false);
      showFeedback('success', 'Account and all profile data have been permanently deleted.', 2500);
      setTimeout(() => {
        onDisconnect();
      }, 900);
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to delete account on server.', 4500);
    } finally {
      setIsDeleting(false);
    }
  };

  const [balanceModal, setBalanceModal] = useState<BalanceModalState>(null);
  const cancelActionsRef = useRef({
    profile: () => {},
    address: () => {},
  });
  cancelActionsRef.current = {
    profile: () => {
      if (userProfile) {
        setAvatarUrl(userProfile.avatarUrl ?? null);
        setNameValue(userProfile.fullName || '');
        setNicknameValue(userProfile.nickname || '');
        setEmailValue(userProfile.email || userEmail || '');
        setPhoneValue(userProfile.phone || '');
        setIsPhoneVerified(Boolean(userProfile.phoneVerified));
      } else if (typeof window !== 'undefined') {
        setAvatarUrl(localStorage.getItem('sera_user_avatar') || null);
        setNameValue(localStorage.getItem('sera_customer_name') || localStorage.getItem('sera_user_name') || '');
        setNicknameValue(localStorage.getItem('sera_user_nickname') || '');
        setEmailValue(
          userEmail || localStorage.getItem('sera_user_email') || localStorage.getItem('sera_saved_email') || ''
        );
        setPhoneValue(localStorage.getItem('sera_user_phone') || localStorage.getItem('sera_customer_phone') || '');
      }
      setViewMode('main');
    },
    address: () => {
      setAddressForm(
        userProfile
          ? toAddressData(userProfile, userProfile.fullName, userProfile.phone)
          : toAddressData(null)
      );
      setIsLocationModalOpen(false);
      setViewMode('main');
    },
  };

  // Native Mobile Sequential Back Button Handling
  useEffect(() => {
    const unregs: (() => void)[] = [];

    if (balanceModal?.isOpen) {
      unregs.push(
        registerBackHandler('profile_balance_modal', 85, () => {
          setBalanceModal(null);
          return true;
        })
      );
    }

    if (showDeleteModal) {
      unregs.push(
        registerBackHandler('profile_delete_modal', 85, () => {
          setShowDeleteModal(false);
          return true;
        })
      );
    }

    if (isLocationModalOpen) {
      unregs.push(
        registerBackHandler('profile_loc_modal', 85, () => {
          setIsLocationModalOpen(false);
          return true;
        })
      );
    }

    if (viewMode !== 'main') {
      unregs.push(
        registerBackHandler('profile_subview', 20, () => {
          if (viewMode === 'profile') {
            cancelActionsRef.current.profile();
          } else if (viewMode === 'address') {
            cancelActionsRef.current.address();
          } else {
            setViewMode('main');
          }
          return true;
        })
      );
    }

    return () => {
      unregs.forEach((u) => u());
    };
  }, [balanceModal, showDeleteModal, isLocationModalOpen, viewMode, setViewMode]);

  // Subscription Tier & Token Usage Calculations
  const currentTier = (billingState.tier || 'FREE').toUpperCase();
  const isPayAsYouGoUnlocked = Boolean(
    billingState.isPayAsYouGoUnlocked ||
      billingState.isEceranUnlocked ||
      currentTier === 'STARTER' ||
      currentTier === 'ENTERPRISE' ||
      currentTier === 'WHALE' ||
      currentTier === 'PRO'
  );
  const agentCredits = billingState.agentCredits ?? 0;
  const isUnlimited = agentCredits === -1 || currentTier === 'ENTERPRISE';

  const dailyTotalTokens = 10000;
  const remainingTokens = isUnlimited
    ? dailyTotalTokens
    : agentCredits > 0 && agentCredits <= dailyTotalTokens
    ? agentCredits
    : typeof window !== 'undefined' && localStorage.getItem('sera_daily_tokens')
    ? parseInt(localStorage.getItem('sera_daily_tokens') || '7500', 10)
    : 7500;

  const tokenPercent = isUnlimited
    ? 100
    : Math.min(100, Math.max(0, Math.round((remainingTokens / dailyTotalTokens) * 100)));

  // Socket Billing Handlers
  useEffect(() => {
    if (!socket) return;

    const handleBillingUpdate = () => {
      setIsProcessing(false);
    };

    const handleSubscribeSuccess = (data: { tier: string; message?: string }) => {
      setIsProcessing(false);
      showFeedback('success', data.message || `${data.tier} plan activated successfully!`, 5000);
    };

    const handleTopupSuccess = (data: { amountUsdc?: number; message?: string }) => {
      setIsProcessing(false);
      showFeedback('success', data.message || `Compute credit top-up processed successfully!`, 5000);
    };

    const handleBillingError = (data: { message?: string }) => {
      setIsProcessing(false);
      showFeedback('error', data.message || 'Service operation failed.', 6000);
    };

    socket.on('billing:update', handleBillingUpdate);
    socket.on('billing:subscribe:success', handleSubscribeSuccess);
    socket.on('billing:topup:success', handleTopupSuccess);
    socket.on('billing:error', handleBillingError);

    socket.emit('billing:fetch');

    return () => {
      socket.off('billing:update', handleBillingUpdate);
      socket.off('billing:subscribe:success', handleSubscribeSuccess);
      socket.off('billing:topup:success', handleTopupSuccess);
      socket.off('billing:error', handleBillingError);
    };
  }, [socket]);

  const handleSubscribePass = (tier: 'STARTER' | 'ENTERPRISE') => {
    const cost = tier === 'ENTERPRISE' ? 450000 : 75000;
    const tierTitle = tier === 'ENTERPRISE' ? 'Enterprise Pass (Rp 450,000/mo)' : 'Starter Pass (Rp 75,000/mo)';

    setBalanceModal({
      isOpen: true,
      requiredAmount: cost,
      itemName: tierTitle,
      tierKey: tier,
    });
  };

  const handleTopupCredits = (amountRp: number) => {
    if (!isPayAsYouGoUnlocked) {
      setBalanceModal({
        isOpen: true,
        requiredAmount: 75000,
        itemName: 'Starter Pass (Rp 75,000/mo)',
        tierKey: 'STARTER',
      });
      return;
    }

    setBalanceModal({
      isOpen: true,
      requiredAmount: amountRp,
      itemName: `Credit Top-Up Rp ${amountRp.toLocaleString('id-ID')}`,
    });
  };

  const handleDevMockSubscribe = (tier: 'FREE' | 'STARTER' | 'ENTERPRISE') => {
    setIsProcessing(true);
    socket?.emit('billing:subscribe_dev_mock', { tier });
  };

  const handleDevMockTopup = (amountUsdc: number) => {
    setIsProcessing(true);
    socket?.emit('billing:topup_dev_mock', { amountUsdc });
  };

  // Profile Edit Lifecycle Handlers
  const restoreProfileFormFromSource = () => {
    if (userProfile) {
      setAvatarUrl(userProfile.avatarUrl ?? null);
      setNameValue(userProfile.fullName || '');
      setNicknameValue(userProfile.nickname || '');
      setEmailValue(userProfile.email || userEmail || '');
      setPhoneValue(userProfile.phone || '');
      setIsPhoneVerified(Boolean(userProfile.phoneVerified));
    } else if (typeof window !== 'undefined') {
      setAvatarUrl(localStorage.getItem('sera_user_avatar') || null);
      setNameValue(localStorage.getItem('sera_customer_name') || localStorage.getItem('sera_user_name') || '');
      setNicknameValue(localStorage.getItem('sera_user_nickname') || '');
      setEmailValue(
        userEmail || localStorage.getItem('sera_user_email') || localStorage.getItem('sera_saved_email') || ''
      );
      setPhoneValue(localStorage.getItem('sera_user_phone') || localStorage.getItem('sera_customer_phone') || '');
    }
  };

  const handleOpenProfileEdit = () => {
    restoreProfileFormFromSource();
    setViewMode('profile');
  };

  const handleCancelProfileEdit = () => {
    restoreProfileFormFromSource();
    setViewMode('main');
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!onUpdateProfile) {
      showFeedback('error', 'Profile storage service is not ready yet.');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateProfile({
        fullName: nameValue.trim(),
        nickname: nicknameValue.trim(),
        phone: phoneValue.trim(),
      });
      showFeedback('success', 'Profile updated permanently!');
      setViewMode('main');
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
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
    handleCancelProfileEdit,
    handleSaveProfile,
    isSaving,

    // Address
    addressForm,
    setAddressForm,
    isLocationModalOpen,
    setIsLocationModalOpen,
    handleOpenAddressEdit,
    handleCancelAddressEdit,
    handleConfirmLocation,
    handleSaveAddress,

    // Subscriptions & Tokens
    currentTier,
    isUnlimited,
    agentCredits,
    tokenPercent,
    isPayAsYouGoUnlocked,
    selectedTopup,
    setSelectedTopup,
    isProcessing,
    balanceModal,
    setBalanceModal,
    handleSubscribePass,
    handleTopupCredits,
    handleDevMockSubscribe,
    handleDevMockTopup,

    // Privacy, Notifications & Cache
    trainAiOptIn,
    handleToggleAiTraining,
    handleClearLocalCache,
    notificationPrefs: userProfile?.notificationPrefs,
    handleUpdateNotificationPrefs,

    // Account Deletion
    showDeleteModal,
    setShowDeleteModal,
    isDeleting,
    handleConfirmDeleteAccount,

    // Status Feedback
    statusFeedback,
    setStatusFeedback,
  };
}
