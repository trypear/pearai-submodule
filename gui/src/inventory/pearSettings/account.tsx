const AccountSettings = () => {
    return (
        <div className="border border-solidd w-full h-full p-5 flex-col justify-start items-start gap-5 inline-flex overflow-hidden">
            <div className="border border-solidd  flex flex-col justify-start items-start gap-5 h-full w-full">
                <div className="justify-center items-center inline-flex">
                    <div className=" text-lg font-['SF Pro']">Account</div>
                </div>
                <div className="self-stretch rounded-lg justify-start items-center gap-3 inline-flex">
                    <img className="w-8 h-8 rounded-[32px]" src="https://placehold.co/32x32" />
                    <div className="grow shrink basis-0 flex-col justify-center items-start gap-1 inline-flex">
                        <div className="self-stretch  text-xs font-normal font-['SF Pro']">Jensen Huang</div>
                        <div className="opacity-50  text-xs font-normal font-['SF Pro']">jensen@nvidia.com</div>
                    </div>
                    <div className="px-3 py-2 bg-[#0e88de] rounded-lg justify-start items-center gap-1 flex overflow-hidden">
                        <div className=" text-xs font-['SF Pro']">Log in</div>
                    </div>
                </div>
                <div className=" flex rounded-lg flex-col w-full justify-center gap-3 overflow-hidden">
                    <div className="flex justify-end items-start gap-3">
                        <div className="grow shrink basis-0 text-white text-xs font-normal font-['SF Pro']">API Key</div>
                        <div data-svg-wrapper>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.35696 8.21493C1.31091 8.07676 1.31086 7.92716 1.35684 7.78895C2.28241 5.00648 4.90712 3 8.00047 3C11.0924 3 13.7161 5.00462 14.6428 7.78507C14.6889 7.92325 14.6889 8.07285 14.6429 8.21105C13.7174 10.9935 11.0926 13 7.9993 13C4.90739 13 2.28369 10.9954 1.35696 8.21493Z" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M9.99993 8C9.99993 9.10457 9.1045 10 7.99993 10C6.89536 10 5.99993 9.10457 5.99993 8C5.99993 6.89543 6.89536 6 7.99993 6C9.1045 6 9.99993 6.89543 9.99993 8Z" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <div data-svg-wrapper>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.5 11.5V13.75C10.5 14.1642 10.1642 14.5 9.75 14.5H3.25C2.83579 14.5 2.5 14.1642 2.5 13.75V5.25C2.5 4.83579 2.83579 4.5 3.25 4.5H4.5C4.84071 4.5 5.17479 4.5284 5.5 4.58296M10.5 11.5H12.75C13.1642 11.5 13.5 11.1642 13.5 10.75V7.5C13.5 4.527 11.3377 2.05904 8.5 1.58296C8.17479 1.5284 7.84071 1.5 7.5 1.5H6.25C5.83579 1.5 5.5 1.83579 5.5 2.25V4.58296M10.5 11.5H6.25C5.83579 11.5 5.5 11.1642 5.5 10.75V4.58296M13.5 9V7.75C13.5 6.50736 12.4926 5.5 11.25 5.5H10.25C9.83579 5.5 9.5 5.16421 9.5 4.75V3.75C9.5 2.50736 8.49264 1.5 7.25 1.5H6.5" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                    </div>
                    <div className=" p-3 bg-list-hoverBackground rounded-lg flex flex-col justify-start items-start gap-1  overflow-hidden">
                        <div className="self-stretch text-xs font-normal font-['SF Pro'] leading-[18px]">•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••</div>
                    </div>
                </div>
                <div className="self-stretch flex-col justify-start items-start gap-3 flex">
                    <div className="self-stretch opacity-50  text-[10px] font-bold font-['SF Pro'] tracking-tight">SUBSCRIPTION</div>
                    <div className="self-stretch rounded-lg flex-col justify-center items-end gap-4 flex overflow-hidden">
                        <div className="self-stretch justify-start items-baseline gap-1 inline-flex">
                            <div className=" text-2xl font-['SF Pro']">42%</div>
                            <div className="opacity-50  text-xs font-normal font-['SF Pro']">of PearAI Credits used</div>
                        </div>
                        <div data-svg-wrapper className="w-full">
                            <svg width="100%" height="8" viewBox="0 0 100 8" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="100%" height="8" rx="4" fill="white" fill-opacity="0.1" />
                                <rect width="42%" height="8" rx="4" fill="white" />
                            </svg>
                        </div>
                        <div className="flex self-stretch justify-start items-baseline gap-3">
                            <div className="grow shrink basis-0 opacity-50  text-xs font-normal font-['SF Pro']">Credits refills monthly (22 days left)</div>
                            <div className="px-3 py-2 bg-[#0e88de] rounded-lg justify-start items-center gap-1 flex overflow-hidden">
                                <div className=" text-xs font-['SF Pro']">Top up credits</div>
                                <div data-svg-wrapper>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 4H3.5C2.67157 4 2 4.67157 2 5.5V12.5C2 13.3284 2.67157 14 3.5 14H10.5C11.3284 14 12 13.3284 12 12.5V7M5 11L14 2M14 2L10.5 2M14 2V5.5" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="self-stretch justify-start items-start gap-3 inline-flex">
                        <div className="grow text-black self-stretch p-3 bg-[#aff349] rounded-lg flex-col justify-center items-start gap-2 inline-flex overflow-hidden">
                            <div className=" text-xs font-normal font-['SF Pro']">Pro · Annual</div>
                            <div className="opacity-50  text-xs font-normal font-['SF Pro']">Current Plan</div>
                        </div>
                        <div className="grow shrink basis-0 h-[60px] justify-start items-start gap-3 flex">
                            <div className="grow shrink basis-0 p-3 bg-[#2a3238] rounded-lg flex-col justify-center items-start gap-3 inline-flex overflow-hidden">
                                <div className="self-stretch h-9 flex-col justify-start items-start gap-2 flex">
                                    <div className=" text-xs font-normal font-['SF Pro']">11/23/2024 - 11/23/2025</div>
                                    <div className="opacity-50  text-xs font-normal font-['SF Pro']">Current Period</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AccountSettings;
