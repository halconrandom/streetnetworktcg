"use client";

import { SignIn } from '@clerk/nextjs'

export const dynamic = 'force-dynamic';
import { motion } from 'motion/react'
import { Gamepad2 } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600/10 border border-red-600/20">
            <Gamepad2 className="h-7 w-7 text-red-600" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Street <span className="text-red-600">Games</span> & <span className="text-amber-500">Books</span>
          </span>
        </div>

        {/* Glass Panel */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl overflow-hidden">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-zinc-400 text-center text-sm mb-6">
            Ingresa a tu cuenta para continuar coleccionando
          </p>

          {/* Clerk SignIn Component */}
          <div className="flex justify-center w-full">
            <SignIn
              path="/sign-in"
              routing="path"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  cardBox: "w-full shadow-none",
                  card: "bg-transparent shadow-none p-0 w-full",
                  main: "w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlock: "hidden",
                  divider: "hidden",
                  formFieldInput: "w-full rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 focus:border-red-600/50 focus:ring-red-600/20 py-3 px-4",
                  formFieldLabel: "text-zinc-400 text-sm font-medium mb-2",
                  formButtonPrimary: "w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium py-3 transition-colors shadow-lg shadow-red-600/20",
                  formButtonReset: "text-zinc-400 hover:text-white text-sm",
                  footerActionLink: "text-red-500 hover:text-red-400 font-medium",
                  footerActionText: "text-zinc-500 text-sm",
                  identityPreviewText: "text-zinc-300",
                  alertText: "text-red-400",
                  formFieldErrorText: "text-red-400 text-xs mt-1",
                },
                variables: {
                  colorPrimary: '#dc2626',
                  colorTextOnPrimaryBackground: 'white',
                  colorBackground: 'transparent',
                  colorText: 'white',
                  colorInputBackground: '#18181b',
                  colorInputText: 'white',
                }
              }}
              signUpUrl="/sign-up"
              redirectUrl="/"
            />
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs mt-6">
          © 2024 Street Games & Books Collector
        </p>
      </motion.div>
    </div>
  )
}
