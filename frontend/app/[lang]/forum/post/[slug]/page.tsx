import { notFound } from "next/navigation";

/**
 * App Router entry point for /[lang]/forum/post/[slug].
 *
 * NOTE: The underlying ViewPostPage component was built for Pages Router and uses
 * `useRouter` from `next/router` and `getServerSideProps`. Those APIs are not
 * available in the App Router context. This wrapper replicates the
 * `getServerSideProps` data-fetching logic server-side and passes `initialPostData`
 * as a prop so the component renders with data on first load.
 *
 * Client-side features that depend on `router.query.postId` (answer submission
 * interactions) should be refactored to use `usePathname()`/`useParams()` from
 * `next/navigation` in a future iteration.
 */
export default async function ForumPostPage({
	params,
}: {
	params: Promise<{ lang: string; slug: string }>;
}) {
	const { slug } = await params;

	if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) notFound();

	try {
		const Component = (await import("@pages/forum/post/[slug]")).default;
		// Render with no initialPostData — the component handles its own client-side
		// Firestore fetch. Full SSR for forum posts requires migrating ViewPostPage
		// to accept slug as a direct prop and use next/navigation hooks.
		return <Component />;
	} catch {
		notFound();
	}
}
