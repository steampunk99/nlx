import { BorderTrail } from "@/components/ui/border-trail";

// components/packages/PackageHeader.jsx
export function PackageHeader() {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 p-8">
        <BorderTrail
          style={{
            boxShadow: '0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)',
          }}
          size={100}
        />
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />
        <div className="relative">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary animate-text-gradient bg-300% mb-4">
            Investment Packages
          </h1>
          <p className="text-xl text-muted-foreground/80 max-w-2xl">
            Start your journey to financial freedom with our carefully crafted investment packages
          </p>
        </div>
      </div>
    )
  }