import { useDispatch } from "react-redux";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import Layout from "./components/Layout";
import { SubmenuContextProvidersContext } from "./context/SubmenuContextProviders";
import { VscThemeContext } from "./context/VscTheme";
import useSetup from "./hooks/useSetup";
import useSubmenuContextProviders from "./hooks/useSubmenuContextProviders";
import { useVscTheme } from "./hooks/useVscTheme";
import { AddNewModel, ConfigureProvider } from "./pages/AddNewModel";
import ErrorPage from "./pages/error";
import GUI from "./pages/gui";
import { default as Help, default as HelpPage } from "./pages/help";
import History from "./pages/history";
import MigrationPage from "./pages/migration";
import MonacoPage from "./pages/monaco";
import ApiKeyAutocompleteOnboarding from "./pages/onboarding/apiKeyAutocompleteOnboarding";
import ApiKeysOnboarding from "./pages/onboarding/ApiKeysOnboarding";
import LocalOnboarding from "./pages/onboarding/LocalOnboarding";
import Onboarding from "./pages/onboarding/Onboarding";
import SettingsPage from "./pages/settings";
import Stats from "./pages/stats";
import PerplexityGUI from "./integrations/perplexity/perplexitygui";
import Welcome from "./pages/welcome/welcomeGui";
import { ContextMenuProvider } from './components/ContextMenuProvider';
import Mem0SidebarGUI from "./integrations/mem0/Mem0SidebarGUI";
import PearSettings from "./inventory/pearSettings/PearSettings";


declare global {
  interface Window {
    initialRoute?: string;
    isFirstLaunch?: boolean;
    isPearOverlay?: boolean;
    viewType?: 'pearai.chatView' | 'pearai.mem0View' | 'pearai.searchView';
  }
}

const router = createMemoryRouter(
  [
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/index.html",
          element: <GUI />,
        },
        {
          path: "/",
          element: window.viewType === 'pearai.chatView' ? <GUI /> :
                   window.viewType === 'pearai.searchView' ? <PerplexityGUI /> :
                   window.viewType === 'pearai.mem0View' ? <Mem0SidebarGUI /> :
                  <GUI />, // default to GUI if viewType is undefined or different

        },
        {
          path: "/perplexityMode",
          element: <PerplexityGUI />,
        },
        {
          path: "/history",
          element: <History from={
            window.viewType === 'pearai.chatView' ? 'continue' :
            window.viewType === 'pearai.searchView' ? 'perplexity' :
            'continue' // default fallback
          }/>
        },
        {
          path: "/stats",
          element: <Stats />,
        },
        {
          path: "/help",
          element: <Help />,
        },
        {
          path: "/settings",
          element: <SettingsPage />,
        },
        {
          path: "/addModel",
          element: <AddNewModel />,
        },
        {
          path: "/addModel/provider/:providerName",
          element: <ConfigureProvider />,
        },
        {
          path: "/help",
          element: <HelpPage />,
        },
        {
          path: "/monaco",
          element: <MonacoPage />,
        },
        {
          path: "/onboarding",
          element: <Onboarding />,
        },
        {
          path: "/localOnboarding",
          element: <LocalOnboarding />,
        },
        {
          path: "/migration",
          element: <MigrationPage />,
        },
        {
          path: "/apiKeysOnboarding",
          element: <ApiKeysOnboarding />,
        },
        {
          path: "/apiKeyAutocompleteOnboarding",
          element: <ApiKeyAutocompleteOnboarding />,
        },
        // Deprecated
        // {
        //   path: "/inventory/*",
        //   element: <Inventory />,
        // },
        {
          path: "/pearSettings",
          element: <PearSettings/>
        },
        {
          path: "/welcome",
          element: <Welcome/>
        },
      ],
    },
  ],
  // TODO: Remove replace /welcome with /inventory when done testing
  {
    initialEntries: [
      window.isPearOverlay
        ? (window.isFirstLaunch ? "/welcome" : "/pearSettings")
        : window.initialRoute
    ],
    // FOR DEV'ing welcome:
    // initialEntries: [window.isPearOverlay ? "/welcome" : window.initialRoute],
  },

);




function App() {
  const dispatch = useDispatch();
  useSetup(dispatch);

  const vscTheme = useVscTheme();
  const submenuContextProvidersMethods = useSubmenuContextProviders();
  return (
    <ContextMenuProvider>
      <VscThemeContext.Provider value={vscTheme}>
        <SubmenuContextProvidersContext.Provider
          value={submenuContextProvidersMethods}
        >
          <RouterProvider router={router} />
        </SubmenuContextProvidersContext.Provider>
      </VscThemeContext.Provider>
    </ContextMenuProvider>
  );
}

export default App;
