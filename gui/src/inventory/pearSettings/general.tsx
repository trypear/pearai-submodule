import {
  Button,
  vscBackground,
  vscBadgeBackground,
  vscButtonBackground,
  vscForeground,
  vscSidebarBorder,
} from "@/components";
import { Progress } from "@/components/ui/progress";
import { useContext, useEffect, useState } from "react";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import { SERVER_URL } from "core/util/parameters";
import { ChevronRight, ExternalLink } from "lucide-react";
import { useWebviewListener } from "@/hooks/useWebviewListener";
import { useAccountSettings } from "./hooks/useAccountSettings";
import { CopyIcon, EyeIcon } from "./components/Icons";
import { LoadingPlaceholder } from "./components/LoadingPlaceholder";
import { unixTimeToHumanReadable, daysUntilCycleEnds, UPGRADE_LINK } from "./utils";
import { Auth, AccountDetails, UsageDetails } from "./types";

const upgradeLink = "https://trypear.ai/pricing";

const AccountSettings = () => {
  const {
    auth,
    showApiKey,
    setShowApiKey,
    usageDetails,
    accountDetails,
    isUsageLoading,
    handleLogin,
    handleLogout,
    handleCopyApiKey,
    fetchUsageData,
    fetchAccountData,
    checkAuth,
  } = useAccountSettings();

  const ideMessenger = useContext(IdeMessengerContext);

  useWebviewListener("pearAISignedIn", async () => {
    const authData = await checkAuth();
    if (authData) {
      await Promise.all([fetchUsageData(authData), fetchAccountData(authData)]);
    }
  });

  return (
    <div className="border border-solidd h-full p-5 flex-col justify-start items-start gap-5 inline-flex overflow-auto no-scrollbar">
      <div className="border border-solidd w-full flex flex-col justify-start items-start gap-5">
        <div className="justify-center items-center inline-flex">
          <div className="text-lg font-['SF Pro']">General</div>
        </div>

        {accountDetails ? (
          <>
            <div className="self-stretch rounded-lg justify-start items-center gap-3 inline-flex">
              {accountDetails?.profile_picture_url && (
                <img
                  className="w-8 h-8 rounded-[32px]"
                  src={accountDetails.profile_picture_url}
                  alt="Profile"
                />
              )}
              <div className="grow shrink basis-0 flex-col justify-center items-start gap-1 inline-flex">
                <div className="self-stretch text-xs font-normal font-['SF Pro']">
                  {accountDetails?.first_name} {accountDetails?.last_name || ""}
                </div>
                <div className="opacity-50 text-xs font-normal font-['SF Pro']">
                  {accountDetails?.email}
                </div>
              </div>
              <Button onClick={handleLogout}>Logout</Button>
            </div>
            <div className="flex flex-col w-full justify-center gap-3">
              <div className="opacity-50 text-xs font-normal font-['SF Pro']">
                USAGE
              </div>
              <div className="border border-solid p-4 rounded-lg flex flex-col gap-3">
                <div className="font-normal font-['SF Pro']">PearAI Credits</div>
                <div className="self-stretch justify-start items-baseline gap-1 inline-flex">
                  <div className="text-2xl font-['SF Pro']">
                    {isUsageLoading ? (
                      <LoadingPlaceholder />
                    ) : (
                      `${usageDetails ? Math.round(usageDetails.percent_credit_used) : 0}%`
                    )}
                  </div>
                  <div className="opacity-50 text-xs font-normal font-['SF Pro']">
                    used
                  </div>
                </div>
                <div data-svg-wrapper className="w-full">
                  <Progress
                    value={usageDetails ? usageDetails.percent_credit_used : 0}
                    className={`h-2 bg-input [&>div]:bg-button ${isUsageLoading ? 'animate-pulse' : ''}`}
                  />
                </div>
                <div className="opacity-50 text-xs font-normal font-['SF Pro']">
                  Credits refills monthly ({daysUntilCycleEnds(accountDetails.plan_period_end)} days left)
                </div>
              </div>
            </div>
            {usageDetails?.remaining_topup_credits && <div className="flex flex-col w-full justify-center gap-3">
              <div className="border border-solid p-4 rounded-lg flex flex-col gap-3">
                <div className="font-normal font-['SF Pro']">TopUp Credits</div>
                <div className="self-stretch justify-start items-baseline gap-1 inline-flex">
                  <div className="text-2xl font-['SF Pro']">
                    ${Math.round(usageDetails.remaining_topup_credits)}
                  </div>
                  <div className="opacity-50 text-xs font-normal font-['SF Pro']">
                    remaining
                  </div>
                </div>
              </div>
            </div>}
            <div className="flex flex-col w-full justify-center gap-3">
              <div className="border border-solid p-4 rounded-lg flex flex-col gap-3">
                <div className="font-normal font-['SF Pro']">
                  Pay-As-You-Go Extra Credits
                </div>
                <div className="self-stretch justify-start items-baseline gap-1 inline-flex">
                  <div className="text-2xl font-['SF Pro']">
                    {isUsageLoading ? (
                      <LoadingPlaceholder />
                    ) : (
                      `$${usageDetails ? Math.round(usageDetails.pay_as_you_go_credits) : 0}`
                    )}
                  </div>
                  <div className="opacity-50 text-xs font-normal font-['SF Pro']">
                    used
                  </div>
                </div>
                <div>
                  <div className="opacity-50 text-xs font-normal font-['SF Pro']">
                    Credits billed monthly
                  </div>
                  <a
                    className="text-xs font-normal font-['SF Pro'] no-underline"
                    href="https://trypear.ai/pay-as-you-go"
                  >
                    Read More
                  </a>
                </div>
              </div>
            </div>
            <div className="flex flex-col w-full justify-center gap-3">
              <div className="opacity-50 text-xs font-normal font-['SF Pro']">
                PLAN
              </div>
              <div className="flex gap-3">
                <div className="border border-solid w-1/2 p-3 rounded-lg">
                  {accountDetails.plan_type.includes("free") ? "" : "Pro · "}{" "}
                  <span className="capitalize">
                    {accountDetails.plan_type.toLowerCase()}
                  </span>
                </div>
                <div className="border border-solid w-1/2 p-3 rounded-lg">
                  {unixTimeToHumanReadable(accountDetails.plan_period_start)} -{" "}
                  {unixTimeToHumanReadable(accountDetails.plan_period_end)}
                  &nbsp;
                  <span className="opacity-50  text-xs font-normal font-['SF Pro']">
                    Current Period
                  </span>
                </div>
              </div>
            </div>

            <div className="self-stretch pb-2 flex-col justify-start items-start gap-3 flex">
              <a
                className="p-3 bg-list-hoverBackground rounded-lg border border-solid justify-between items-center flex self-stretch no-underline text-inherit hover:text-inherit"
                href={UPGRADE_LINK}
              >
                <div className="text-xs font-normal font-['SF Pro']">
                  Upgrade
                </div>
                <ExternalLink className="size-4" />
              </a>
            </div>
            <div className="flex flex-col w-full gap-3">
              <div className="flex">
                <div className="grow opacity-50 text-xs font-normal font-['SF Pro']">
                  API Key
                </div>
                <div className="flex gap-3">
                  <div
                    className="cursor-pointer"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    <EyeIcon />
                  </div>
                  <div className="cursor-pointer" onClick={handleCopyApiKey}>
                    <CopyIcon />
                  </div>
                </div>
              </div>
              <div className="p-3 self-stretch bg-list-hoverBackground rounded-lg flex items-center text-ellipsis whitespace-normal overflow-hidden relative text-nowrap">
                <div className="w-full overflow-hidden relative">
                  <div className="pr-8">
                    {showApiKey ? auth?.accessToken : "•".repeat(1000)}
                  </div>
                  <div className="absolute inset-y-0 right-0 w-96 bg-gradient-to-r from-transparent to-list-hoverBackground pointer-events-none"></div>
                </div>
              </div>
            </div>

          </>
        ) : (
          <div className="self-stretch rounded-lg justify-start items-center gap-3 inline-flex">
            <Button onClick={handleLogin}>Log in</Button>
            <div className="opacity-50 text-xs font-normal font-['SF Pro']">
              Login to use PearAI Pro services
            </div>
          </div>
        )}


        <div className="flex flex-col w-full justify-center gap-3">
          <div className="opacity-50 text-xs font-normal font-['SF Pro']">
            EDITOR SETTINGS
          </div>
          <div className="flex gap-3">
            <a
              className="flex-1 p-3 bg-list-hoverBackground rounded-lg border border-solid justify-between items-center flex self-stretch no-underline text-inherit hover:text-inherit"
              href="command:workbench.action.openSettings"
            >
              <div className="text-xs font-normal font-['SF Pro']">
                Open editor settings
              </div>
              <ChevronRight className="size-4" />
            </a>
            <a
              className="flex-1 p-3 bg-list-hoverBackground rounded-lg border border-solid justify-between items-center flex self-stretch no-underline text-inherit hover:text-inherit"
              href="command:workbench.action.openGlobalKeybindings"
            >
              <div className="text-xs font-normal font-['SF Pro']">
                Configure keyboard Shortcuts
              </div>
              <ChevronRight className="size-4" />
            </a>
          </div>
        </div>
        <div className="flex flex-col w-full justify-center gap-3">
          <div className="opacity-50 text-xs font-normal font-['SF Pro']">
            PEARAI AGENT SETTINGS
          </div>
          <div
            className="flex-1 p-3 bg-list-hoverBackground cursor-pointer rounded-lg border border-solid justify-between items-center flex self-stretch no-underline text-inherit hover:text-inherit"
            onClick={() => {
              ideMessenger.post("closeOverlay", undefined);
              ideMessenger.post("invokeVSCodeCommandById", {
                commandId: "pearai-roo-cline.SidebarProvider.focus",
              });
              ideMessenger.post("invokeVSCodeCommandById", {
                commandId: "roo-cline.settingsButtonClicked",
              });
            }}
          >
            <div className="text-xs font-normal font-['SF Pro']">
              Open PearAI Agent Settings
            </div>
            <ChevronRight className="size-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
