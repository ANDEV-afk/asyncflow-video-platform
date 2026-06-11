import Link from "next/link";
import {
  ArrowRight,
  Building2,
  MessageSquare,
  Play,
  Sparkles,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingWorkspacePreview from "@/components/landing/LandingWorkspacePreview";

const features = [
  {
    icon: Video,
    title: "Async Recording",
    description:
      "Record screen, camera, or both. Share updates without scheduling meetings.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Building2,
    title: "Team Workspaces",
    description:
      "Organize videos by team. Invite members, track activity, and collaborate.",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    icon: MessageSquare,
    title: "Threaded Comments",
    description:
      "Discuss videos with context. Reply to feedback and keep conversations clear.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    title: "Instant Sharing",
    description:
      "Public, unlisted, or private visibility. Share links and control who sees what.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

const stats = [
  { value: "10x", label: "Faster than meetings" },
  { value: "24/7", label: "Async collaboration" },
  { value: "∞", label: "Recordings & comments" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-sky-500 text-sm font-bold text-white shadow-lg shadow-violet-500/25">
              A
            </div>
            <span className="text-lg font-bold tracking-tight">Async AI</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="rounded-full">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild className="rounded-full bg-gradient-to-r from-violet-600 to-violet-500 shadow-lg shadow-violet-500/25">
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pb-32 md:pt-28">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="absolute right-0 bottom-0 size-[400px] rounded-full bg-sky-500/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="size-4 text-violet-500" />
              The future of async communication
            </div>

            <h1 className="text-4xl font-bold tracking-tight md:text-6xl md:leading-[1.1]">
              Record once.{" "}
              <span className="bg-gradient-to-r from-violet-600 to-sky-500 bg-clip-text text-transparent">
                Collaborate forever.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Stop wasting time in meetings. Record async video updates, share
              with your team, and get feedback through threaded comments — all
              in one beautiful platform.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="h-12 rounded-full bg-gradient-to-r from-violet-600 to-violet-500 px-8 text-base shadow-lg shadow-violet-500/25"
              >
                <Link href="/sign-up">
                  Start for free
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 rounded-full px-8 text-base"
              >
                <Link href="/sign-in">
                  <Play className="mr-2 size-4" />
                  Sign in
                </Link>
              </Button>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8 border-t pt-12">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold md:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="border-t bg-muted/30 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Everything you need to go async
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                From solo creators to growing teams — record, organize, and
                collaborate without the calendar chaos.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border bg-card p-6 shadow-sm transition-all hover:border-violet-500/30 hover:shadow-md"
                >
                  <div
                    className={`mb-4 flex size-12 items-center justify-center rounded-xl ${feature.bg}`}
                  >
                    <feature.icon className={`size-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Built for teams that value their time
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Create workspaces, invite your team, and stay in the loop with
                  real-time activity feeds and smart notifications.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Workspace activity feed — see who uploaded, commented, or joined",
                    "Dashboard with stats, recent videos, and team updates",
                    "Search videos by title or description instantly",
                    "Notifications for comments, uploads, and new members",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10">
                        <Users className="size-3 text-violet-600" />
                      </div>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-8 rounded-full" size="lg">
                  <Link href="/sign-up">
                    Create your workspace
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>

              <LandingWorkspacePreview />
            </div>
          </div>
        </section>

        <section className="border-t bg-gradient-to-br from-violet-600 to-violet-700 px-6 py-20 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Ready to ditch the meeting marathon?
            </h2>
            <p className="mt-4 text-lg text-violet-100">
              Join teams already collaborating asynchronously with Async AI.
            </p>
            <Button
              size="lg"
              asChild
              className="mt-8 h-12 rounded-full bg-white px-8 text-base text-violet-700 hover:bg-violet-50"
            >
              <Link href="/sign-up">
                Get started — it&apos;s free
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-sky-500 text-xs font-bold text-white">
              A
            </div>
            <span className="text-sm font-semibold">Async AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Async video collaboration for modern teams.
          </p>
        </div>
      </footer>
    </div>
  );
}
