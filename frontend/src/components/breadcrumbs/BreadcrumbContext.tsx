"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type BreadcrumbContextValue = {
	/** When set on a shopping product page, replaces the last crumb with this label (e.g. shortName). Ignored elsewhere — see BreadcrumbWrapper. */
	lastCrumbTitle: string | null;
	setLastCrumbTitle: (value: string | null) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
	const [lastCrumbTitle, setLastCrumbTitle] = useState<string | null>(null);
	const value = useMemo(
		() => ({ lastCrumbTitle, setLastCrumbTitle }),
		[lastCrumbTitle],
	);
	return (
		<BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>
	);
}

/** Safe on pages without a provider (no-op setter). */
export function useBreadcrumbLastCrumb(): BreadcrumbContextValue {
	const ctx = useContext(BreadcrumbContext);
	if (!ctx) {
		return {
			lastCrumbTitle: null,
			setLastCrumbTitle: () => {},
		};
	}
	return ctx;
}
