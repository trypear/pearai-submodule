import { Button, vscBackground, vscBadgeBackground, vscButtonBackground, vscForeground, vscSidebarBorder } from "@/components";
import { Progress } from "@/components/ui/progress"
import { useContext, useEffect, useState } from "react";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import { SERVER_URL } from "core/util/parameters";
import { ExternalLink } from "lucide-react";


interface UsageDetails {
    percent_credit_used: number;
    remaining_topup_credits: number | null;
    pay_as_you_go_credits: number;
    ttl: number;
}

// {"email":"himanshusinghc2001@gmail.com",
//     "user_id":"4f444409-343f-4d93-9390-ac6e47978475",
//     "first_name":"Himanshu",
//     "last_name":"Chauhan",
//     "profile_picture_url":null,
//     "plan_type":"MONTHLY",
//     "plan_period_start":1732864883,
//     "plan_period_end":1735456883,
//     "is_subscription_active":false,
//     "requests_used":0,
//     "has_set_password":true}

interface AccountDetails {
    email: string;
    first_name: string;
    last_name: string;
    profile_picture_url: string;
    plan_type: string;
    plan_period_start: number;
    plan_period_end: number;
    is_subscription_active: boolean;
    requests_used: number;
}

function unixTimeToHumanReadable(unixTimestamp) {
    // Create a new Date object from the Unix timestamp (in milliseconds)
    const date = new Date(unixTimestamp * 1000);

    // Get date components in user's timezone
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();

    // Return formatted date string
    return `${day}/${month}/${year}`;
}

function daysUntilCycleEnds(cycleEndDate) {
    const now = new Date();
    const endDate = cycleEndDate * 1000;
    const differenceInTime = endDate - now.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));
    console.dir(differenceInDays)
    return differenceInDays < 0 ? 0 : differenceInDays;
}

interface Auth { accessToken?: string, refreshToken?: string }

const upgradeLink = "https://trypear.ai/pricing"

const AccountSettings = () => {
    const [auth, setAuth] = useState<Auth | null>(null);
    const [showApiKey, setShowApiKey] = useState(false);
    const [usageDetails, setUsageDetails] = useState<UsageDetails | null>(null);
    const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
    const ideMessenger = useContext(IdeMessengerContext);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await ideMessenger.request("getPearAuth", undefined);
                setAuth(res);
                return res;
            } catch (error) {
                console.error("Error checking auth status:", error);
            }
        };

        const fetchUsageData = async (authData: Auth) => {
            try {
                const response = await fetch(
                    `${SERVER_URL}/get-usage`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${authData.accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! {fetchUsageData} Status: ${response.status}`);
                }
                const data = await response.json();
                setUsageDetails(data)
            } catch (err) {
                console.error("Error fetching usage data", err);
            }
        };

        const fetchAccountData = async (authData: Auth) => {
            try {
                const response = await fetch(
                    `${SERVER_URL}/account`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${authData.accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! {fetchAccountData} Status: ${response.status}`);
                }
                const data = await response.json();
                console.dir(data);
                setAccountDetails(data)
            } catch (err) {
                console.error("Error fetching account data", err);
            }
        };

        (async () => {
            const authData = await checkAuth();
            console.dir("BBBBBBBBBB");
            if (authData) {
                fetchUsageData(authData);
                fetchAccountData(authData);
            }
        })();
    }, []);

    const handleLogin = () => {
        ideMessenger.request("authenticatePear", undefined);
    };

    const handleLogout = () => {
        // ideMessenger.request("pearai.logout", undefined);
        setAuth(null);
        setUsageDetails(null);
    };

    const handleCopyApiKey = async () => {
        if (auth?.accessToken) {
            try {
                await navigator.clipboard.writeText(auth.accessToken);
            } catch (error) {
                console.error("Failed to copy API key:", error);
            }
        }
    };

    return (
        <div className="border border-solidd w-full h-full p-5 flex-col justify-start items-start gap-5 inline-flex overflow-hidden">
            <div className="border border-solidd  flex flex-col justify-start items-start gap-5 h-full w-full">
                <div className="justify-center items-center inline-flex">
                    <div className=" text-lg font-['SF Pro']">Account</div>
                </div>

                {accountDetails ? (
                    <>
                        <div className="self-stretch rounded-lg justify-start items-center gap-3 inline-flex">
                            {accountDetails?.profile_picture_url && <img className="w-8 h-8 rounded-[32px]" src={accountDetails.profile_picture_url} />}
                            <div className="grow shrink basis-0 flex-col justify-center items-start gap-1 inline-flex">
                                <div className="self-stretch text-xs font-normal font-['SF Pro']">{accountDetails?.first_name} {accountDetails?.last_name ? accountDetails?.last_name : ""}</div>
                                <div className="opacity-50 text-xs font-normal font-['SF Pro']">{accountDetails?.email}</div>
                            </div>
                            <Button onClick={handleLogout}>Logout</Button>
                        </div>


                        <div className="flex flex-col w-full justify-center gap-3">
                            <div className="opacity-50 text-xs font-normal font-['SF Pro']">USAGE</div>
                            <div className="border border-solid p-4 rounded-lg flex flex-col gap-3">
                                <div className="font-normal font-['SF Pro']">PearAI Credits</div>
                                <div className="self-stretch justify-start items-baseline gap-1 inline-flex">
                                    <div className=" text-2xl font-['SF Pro']">
                                        {usageDetails ? `${Math.round(usageDetails.percent_credit_used)}%` : '0%'}
                                    </div>
                                    <div className="opacity-50  text-xs font-normal font-['SF Pro']">used</div>
                                </div>
                                <div data-svg-wrapper className="w-full">
                                    <Progress
                                        value={usageDetails ? usageDetails.percent_credit_used : 0}
                                        className="h-2 bg-input [&>div]:bg-button"
                                    />
                                </div>
                                <div className="opacity-50  text-xs font-normal font-['SF Pro']">Credits refills monthly ({daysUntilCycleEnds(accountDetails.plan_period_end)} days left)</div>
                            </div>
                        </div>
                        <div className="flex flex-col w-full justify-center gap-3">
                            <div className="border border-solid p-4 rounded-lg flex flex-col gap-3">
                                <div className="font-normal font-['SF Pro']">Pay-As-You-Go Extra Credits</div>
                                <div className="self-stretch justify-start items-baseline gap-1 inline-flex">
                                    <div className=" text-2xl font-['SF Pro']">
                                        {usageDetails ? `$${Math.round(usageDetails.pay_as_you_go_credits)}` : '0'}
                                    </div>
                                    <div className="opacity-50  text-xs font-normal font-['SF Pro']">used</div>
                                </div>
                                <div>
                                    <div className="opacity-50  text-xs font-normal font-['SF Pro']">Credits billed monthly</div>
                                    <a className="text-xs font-normal font-['SF Pro'] no-underline" href="https://trypear.ai/pay-as-you-go">Read More</a>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col w-full justify-center gap-3">
                            <div className="opacity-50 text-xs font-normal font-['SF Pro']">PLAN</div>
                            <div className="flex gap-3">
                                <div className="border border-solid w-1/2 p-3 rounded-lg">
                                    {accountDetails.plan_type.includes("free") ? "" : "Pro · "} <span className="capitalize">{accountDetails.plan_type.toLowerCase()}</span>
                                </div>
                                <div className="border border-solid w-1/2 p-3 rounded-lg">
                                    {unixTimeToHumanReadable(accountDetails.plan_period_start)} - {unixTimeToHumanReadable(accountDetails.plan_period_end)}
                                    &nbsp;
                                    <span className="opacity-50  text-xs font-normal font-['SF Pro']">Current Period</span>
                                </div>
                            </div>
                        </div>

                        <div className="self-stretch pb-2 flex-col justify-start items-start gap-3 flex">
                            <div className="self-stretch  opacity-50  text-[10px] font-bold font-['SF Pro'] tracking-tight">TUTORIAL</div>
                            <a className="p-3 bg-list-hoverBackground rounded-lg border border-solid justify-between items-center flex self-stretch no-underline text-inherit hover:text-inherit" href={upgradeLink}>
                                <div className=" text-xs font-normal font-['SF Pro']" >Upgrade</div>
                                <ExternalLink className="size-4"></ExternalLink>
                            </a>
                        </div>
                        <div>
                            {/* {usageDetails.pay_as_you_go_credits} */}
                            {JSON.stringify(usageDetails)}
                        </div>
                        {/* API KEY */}
                        <div className="flex justify-end items-start gap-3">
                            <div className="grow shrink basis-0 text-white text-xs font-normal font-['SF Pro']">API Key</div>
                            <div className="cursor-pointer" onClick={() => setShowApiKey(!showApiKey)}>
                                <EyeSVG />
                            </div>
                            <div className="cursor-pointer" onClick={handleCopyApiKey}>
                                <CopySVG />
                            </div>
                        </div>
                        <div className="p-3 bg-list-hoverBackground rounded-lg flex items-center overflow-hidden text-ellipsis whitespace-normal break-all">
                            {showApiKey ? auth.accessToken : "•".repeat(100)}
                        </div>
                        {
                            usageDetails ? (
                                <div className="self-stretch flex-col justify-start items-start gap-3 flex">
                                    <div className="self-stretch opacity-50  text-[10px] font-bold font-['SF Pro'] tracking-tight">SUBSCRIPTION</div>
                                    <div className="self-stretch rounded-lg flex-col justify-center items-end gap-4 flex overflow-hidden">

                                    </div>
                                    <div className="flex flex-row w-full gap-3">
                                        <div className="w-1/2 p-3 rounded-lg flex-col justify-center border-2 border-solid items-start gap-2 inline-flex overflow-hidden relative">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-[#aff349] rounded-full blur-[100px] opacity-70" />
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] bg-[#aff349] rounded-full blur-[50px] opacity-80" />
                                            <div className="relative text-white text-xs font-normal font-['SF Pro']">PRO - {accountDetails.plan_type}</div>
                                            <div className="relative opacity-50 text-white text-xs font-normal font-['SF Pro']">Current Plan</div>
                                        </div>
                                        <div className="w-1/2 p-3 rounded-lg flex-col justify-center items-start gap-2 inline-flex overflow-hidden relative bg-list-hoverBackground">
                                            <div className="relative text-white text-xs font-normal font-['SF Pro']">{unixTimeToHumanReadable(accountDetails.plan_period_start)} - {unixTimeToHumanReadable(accountDetails.plan_period_end)}</div>
                                            <div className="relative opacity-50 text-white text-xs font-normal font-['SF Pro']">Current Period</div>
                                        </div>
                                        {/* <div className="w-1/2 justify-start items-start gap-3 flex">
                                            <div className="grow p-3 rounded-lg flex-col justify-center items-start gap-3 inline-flex overflow-hidden bg-list-hoverBackground">
                                                <div className="relative text-white text-xs font-normal font-['SF Pro']">
                                                    {usageDetails ? `Credits: ${usageDetails.pay_as_you_go_credits}` : 'Loading...'}
                                                </div>
                                                <div className="relative opacity-50 text-white text-xs font-normal font-['SF Pro']">
                                                    {usageDetails?.remaining_topup_credits !== null
                                                        ? `Remaining Topup: ${usageDetails.remaining_topup_credits}`
                                                        : 'No additional credits'}
                                                </div>
                                            </div>
                                        </div> */}
                                    </div>

                                </div>
                            ) : null}
                    </>
                ) : (
                    <div className="self-stretch rounded-lg justify-center items-center gap-3 inline-flex">
                        <Button onClick={handleLogin}>Login to PearAI</Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AccountSettings;


const CopySVG = () => {
    return (
        <div data-svg-wrapper>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.5 11.5V13.75C10.5 14.1642 10.1642 14.5 9.75 14.5H3.25C2.83579 14.5 2.5 14.1642 2.5 13.75V5.25C2.5 4.83579 2.83579 4.5 3.25 4.5H4.5C4.84071 4.5 5.17479 4.5284 5.5 4.58296M10.5 11.5H12.75C13.1642 11.5 13.5 11.1642 13.5 10.75V7.5C13.5 4.527 11.3377 2.05904 8.5 1.58296C8.17479 1.5284 7.84071 1.5 7.5 1.5H6.25C5.83579 1.5 5.5 1.83579 5.5 2.25V4.58296M10.5 11.5H6.25C5.83579 11.5 5.5 11.1642 5.5 10.75V4.58296M13.5 9V7.75C13.5 6.50736 12.4926 5.5 11.25 5.5H10.25C9.83579 5.5 9.5 5.16421 9.5 4.75V3.75C9.5 2.50736 8.49264 1.5 7.25 1.5H6.5" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </div>
    )
}

const EyeSVG = () => {
    return (
        <div data-svg-wrapper>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.35696 8.21493C1.31091 8.07676 1.31086 7.92716 1.35684 7.78895C2.28241 5.00648 4.90712 3 8.00047 3C11.0924 3 13.7161 5.00462 14.6428 7.78507C14.6889 7.92325 14.6889 8.07285 14.6429 8.21105C13.7174 10.9935 11.0926 13 7.9993 13C4.90739 13 2.28369 10.9954 1.35696 8.21493Z" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M9.99993 8C9.99993 9.10457 9.1045 10 7.99993 10C6.89536 10 5.99993 9.10457 5.99993 8C5.99993 6.89543 6.89536 6 7.99993 6C9.1045 6 9.99993 6.89543 9.99993 8Z" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </div>
    )
}