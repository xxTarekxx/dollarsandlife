import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SubscribePopup } from "./SubscribePopup";

const STORAGE_KEY = "sub_seen:shopping-deals";
const DELAY_MS = 3000;

export const DealsController: React.FC = () => {
    const router = useRouter();
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        // Only run on client side
        if (typeof window === "undefined") return;

        const path = router.asPath || router.pathname || "";

        // Check if path includes "/shopping-deals"
        if (!path.includes("/shopping-deals")) {
            setShowPopup(false);
            return;
        }

        // Check localStorage for suppression
        const seen = localStorage.getItem(STORAGE_KEY);
        if (seen === "1") {
            setShowPopup(false);
            return;
        }

        // Wait 3000ms then show popup
        const timer = setTimeout(() => {
            setShowPopup(true);
        }, DELAY_MS);

        return () => {
            clearTimeout(timer);
        };
    }, [router.asPath, router.pathname]);

    const handleClose = () => {
        // Set localStorage key to suppress re-show
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, "1");
        }
        setShowPopup(false);
    };

    const handleSubmit = async (email: string) => {
        try {
            await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, segment: "shopping-deals" }),
            });
        } catch {
            // Silently fail for placeholder API
        }
        // Set localStorage key to suppress re-show
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, "1");
        }
    };

    if (!showPopup) {
        return null;
    }

    return (
        <SubscribePopup
            message="Get exclusive, up-to-date deals."
            segment="shopping-deals"
            onClose={handleClose}
            onSubmit={handleSubmit}
        />
    );
};

export default DealsController;

