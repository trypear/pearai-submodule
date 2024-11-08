"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useContext, useState, useEffect } from "react";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import { Bot, Sparkles, MessageSquare, Search } from "lucide-react";
import { getLogoPath } from "./ImportExtensions";

interface Tool {
    id: string;
    name: string;
    description: string;
    icon: JSX.Element | string;
    installCommand: () => Promise<void>;
    preInstalled: boolean;
}


export default function InstallTools({
    onNext,
}: {
    onNext: () => void;
}) {

    const handleVSCExtensionInstall = async (extensionId: string) => {
        await ideMessenger.post("install_vscode_extension", { extensionId });
    };

    const handleAiderInstall = async () => {
        await ideMessenger.post("install_aider", undefined);
    };

    const tools: Tool[] = [
        {
            id: "aider",
            name: "Aider",
            description: "A command-line tool that lets you pair program with GPT-4, editing code and files together in your terminal.",
            icon: "inventory-creator.svg",
            installCommand: handleAiderInstall,
            preInstalled: false
        },
        {
            id: "supermaven",
            name: "SuperMaven",
            description: "An AI-powered tool that helps you understand and navigate complex codebases with semantic search and analysis.",
            icon: <Sparkles className="h-6 w-6" />,
            installCommand: () => handleVSCExtensionInstall("supermaven.supermaven"),
            preInstalled: false
        }
    ];

    const ideMessenger = useContext(IdeMessengerContext);
    const [isInstallingAll, setIsInstallingAll] = useState(false);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [attemptedInstalls, setAttemptedInstalls] = useState<string[]>(() => {
        const saved = localStorage.getItem('onboardingAttemptedInstalls');
        return saved ? JSON.parse(saved) : [];
    });

    const [checkedTools, setCheckedTools] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        tools.forEach(tool => {
            initialState[tool.id] = true;
        });
        return initialState;
    });



    const handleInstallAll = async () => {
        setIsInstallingAll(true);

        const toolsToInstall = tools.filter(tool => !attemptedInstalls.includes(tool.id));
        toolsToInstall.forEach(tool => tool.installCommand());

        // Save to attempted installations
        const newAttemptedInstalls = [...new Set([...attemptedInstalls, ...toolsToInstall.map(t => t.id)])];
        localStorage.setItem('onboardingAttemptedInstalls', JSON.stringify(newAttemptedInstalls));
        setAttemptedInstalls(newAttemptedInstalls);

        setTimeout(() => {
            setIsInstallingAll(false);
            onNext();
        }, 3000);
    };

    const handleCheckboxChange = (toolId: string) => {
        setCheckedTools(prev => ({ ...prev, [toolId]: !prev[toolId] }));
    };

    const handleInstallChecked = async () => {
        setIsInstallingAll(true);
        
        const selectedTools = tools.filter(tool => 
            checkedTools[tool.id] && !attemptedInstalls.includes(tool.id)
        );
        selectedTools.forEach(tool => tool.installCommand());

        // Save to attempted installations
        const newAttemptedInstalls = [...new Set([...attemptedInstalls, ...selectedTools.map(t => t.id)])];
        localStorage.setItem('onboardingAttemptedInstalls', JSON.stringify(newAttemptedInstalls));
        setAttemptedInstalls(newAttemptedInstalls);

        setTimeout(() => {
            setIsInstallingAll(false);
            onNext();
        }, 3000);
    };

    const areAllToolsSelected = () => {
        return tools.every(tool => checkedTools[tool.id]);
    };

    const areAnyToolsSelected = () => {
        return tools.some(tool => checkedTools[tool.id]);
    };

    const areAllToolsAttempted = () => {
        return tools.every(tool => attemptedInstalls.includes(tool.id));
    };

    const getButtonText = () => {
        if (areAllToolsAttempted()) {
            return "All Tools Setup Initiated";
        }
        if (!areAnyToolsSelected()) {
            return "None Selected";
        }
        return areAllToolsSelected() ? "Install All Tools" : "Install Selected Tools";
    };

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Enter' && !isInstallingAll) {
                handleInstallAll();
            } else if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowRight') {
                event.preventDefault();
                onNext();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isInstallingAll]);

    return (
        <div className="step-content flex w-full h-screen items-center justify-center bg-background text-foreground">
            <div className="w-full max-w-[800px] flex flex-col items-center p-4">
                <h5 className="text-xl md:text-2xl lg:text-2xl font-bold text-foreground mb-12 text-center">
                    PearAI requires some extra installation to give you the complete experience
                </h5>



                <details className="w-full mb-4" onToggle={() => setIsAdvancedOpen(!isAdvancedOpen)}>
                    <summary className="cursor-pointer text-sm hover:text-muted-foreground transition-colors">
                        Advanced Configuration
                    </summary>
                    <div className="space-y-2 mt-4">
                        {tools.map((tool) => (
                            <Card key={tool.id} className={`p-4 flex items-center border-solid border-2 justify-between ${
                                tool.preInstalled || attemptedInstalls.includes(tool.id) ? 'opacity-60' : ''
                            }`}>
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="p-2 bg-muted rounded-lg">
                                        {typeof tool.icon === 'string' ? <img src={getLogoPath(tool.icon)} alt={tool.name} className="h-6 w-6" /> : tool.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="font-semibold text-lg">{tool.name}</div>
                                            {(tool.preInstalled || attemptedInstalls.includes(tool.id)) && (
                                                <span className="text-xs ml-2 bg-foreground  text-white  px-2 py-1 rounded-md">
                                                    {tool.preInstalled ? 'Pre-installed' : 'Setup initiated'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center h-5 ml-4">
                                    <input
                                        type="checkbox"
                                        checked={checkedTools[tool.id] || false}
                                        onChange={() => handleCheckboxChange(tool.id)}
                                        disabled={tool.preInstalled || attemptedInstalls.includes(tool.id)}
                                        className="w-4 h-4 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary"
                                        style={{
                                            accentColor: 'var(--button)',
                                        }}
                                    />
                                </div>
                            </Card>
                        ))}

                        <div className="flex justify-end mt-4">
                            <Button
                                className="w-[250px] mt-2 text-button-foreground bg-button hover:bg-button-hover p-4 lg:py-6 lg:px-2 text-sm md:text-base cursor-pointer"
                                onClick={handleInstallChecked}
                                disabled={isInstallingAll || !areAnyToolsSelected() || areAllToolsAttempted()}
                            >
                                {getButtonText()}
                            </Button>
                        </div>
                    </div>
                </details>

                {!isAdvancedOpen && (
                    <Button
                        className="w-[250px] mb-2 text-button-foreground bg-button hover:bg-button-hover p-4 lg:py-6 lg:px-2 text-sm md:text-base cursor-pointer"
                        onClick={handleInstallAll}
                        disabled={isInstallingAll || areAllToolsAttempted()}
                    >
                        {areAllToolsAttempted() ? "All Tools Setup Initiated" : "Install All Tools"}
                    </Button>
                )}

                <div
                    onClick={onNext}
                    className="mt-4 text-center text-sm cursor-pointer hover:text-muted-foreground transition-colors"
                >
                    Skip
                </div>
            </div>
        </div>
    );
}
