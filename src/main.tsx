import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import ErrorBoundary from "./components/ErrorBoundary";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <GoogleOAuthProvider clientId="898191346918-5o83s2q8p61vugnc32iph98cr5d744ff.apps.googleusercontent.com">
        <React.StrictMode>
            <ChakraProvider>
                <ErrorBoundary>
                    <App />
                </ErrorBoundary>
            </ChakraProvider>
        </React.StrictMode>
    </GoogleOAuthProvider>
);
