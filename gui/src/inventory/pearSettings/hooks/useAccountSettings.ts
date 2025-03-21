import { useState, useContext, useEffect } from 'react';
import { IdeMessengerContext } from "@/context/IdeMessenger";
import { SERVER_URL } from "core/util/parameters";
import { Auth, AccountDetails, UsageDetails } from '../types';

export const useAccountSettings = () => {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [usageDetails, setUsageDetails] = useState<UsageDetails | null>(null);
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
  const [isUsageLoading, setIsUsageLoading] = useState(false);
  const ideMessenger = useContext(IdeMessengerContext);

  const fetchUsageData = async (authData: Auth) => {
    setIsUsageLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/get-usage`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! {fetchUsageData} Status: ${response.status}`);
      }
      const data = await response.json();
      setUsageDetails(data);
    } catch (err) {
      console.error("Error fetching usage data", err);
    } finally {
      setIsUsageLoading(false);
    }
  };

  const fetchAccountData = async (authData: Auth) => {
    try {
      const response = await fetch(`${SERVER_URL}/account`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! {fetchAccountData} Status: ${response.status}`);
      }
      const data = await response.json();
      localStorage.setItem('pearai_account_details', JSON.stringify(data));
      setAccountDetails(data);
    } catch (err) {
      console.error("Error fetching account data", err);
    }
  };

  const checkAuth = async () => {
    try {
      const res = await ideMessenger.request("getPearAuth", undefined);
      setAuth(res);
      return res;
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  };

  const handleLogin = () => {
    ideMessenger.post("pearaiLogin", undefined);
  };

  const handleLogout = () => {
    clearUserData();
    ideMessenger.post("pearaiLogout", undefined);
  };

  const clearUserData = () => {
    localStorage.removeItem('pearai_account_details');
    setAuth(null);
    setUsageDetails(null);
    setAccountDetails(null);
  };

  const copyApiKey = async () => {
    if (auth?.accessToken) {
      try {
        await navigator.clipboard.writeText(auth.accessToken);
      } catch (error) {
        console.error("Failed to copy API key:", error);
      }
    }
  };

  const refreshData = async () => {
    const authData = await checkAuth();
    if (authData) {
      await Promise.all([fetchUsageData(authData), fetchAccountData(authData)]);
    }
  };

  useEffect(() => {
    const cachedAccountDetails = localStorage.getItem('pearai_account_details');
    if (cachedAccountDetails) {
      try {
        const parsedDetails = JSON.parse(cachedAccountDetails);
        setAccountDetails(parsedDetails);
      } catch (parseError) {
        console.error("Failed to parse cached account details:", parseError);
      }
    }

    refreshData();
  }, []);

  return {
    auth,
    showApiKey,
    setShowApiKey,
    usageDetails,
    accountDetails,
    isUsageLoading,
    handleLogin,
    handleLogout,
    clearUserData,
    copyApiKey,
    checkAuth,
    fetchUsageData,
    fetchAccountData,
    refreshData,
  };
}; 