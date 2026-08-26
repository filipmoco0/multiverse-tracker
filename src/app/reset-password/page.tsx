'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { KeyRound, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ComicButton } from '@/components/comic/ComicButton';
import { ComicBadge } from '@/components/comic/ComicBadge';
import { triggerGrandCelebration } from '@/components/comic/ConfettiCelebration';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setErrorMessage(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setErrorMessage('Supabase client is not available.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setIsSuccess(true);
      triggerGrandCelebration('mcu');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password. Please request a new reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Comic Halftone */}
      <div className="absolute inset-0 bg-halftone-marvel opacity-30 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md bg-[#141624] border-[4px] border-black shadow-[10px_10px_0px_0px_#000000] p-6 sm:p-8 space-y-6 z-10 text-white"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-400 text-black border-[3px] border-black -skew-x-6 flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#000000]">
            <KeyRound className="w-7 h-7 skew-x-6" />
          </div>
          <div className="pt-2">
            <ComicBadge variant="gold" size="sm">Security Recovery</ComicBadge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-wider text-white">
            Reset Password
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Enter your new password below to secure your Multiverse Tracker account.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/90 border-2 border-rose-600 shadow-[3px_3px_0px_0px_#000000] text-rose-200 text-xs font-sans flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success State */}
        {isSuccess ? (
          <div className="space-y-5 text-center py-3">
            <div className="p-4 bg-emerald-950/80 border-2 border-emerald-500 shadow-[3px_3px_0px_0px_#000000] space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="font-display font-black text-lg uppercase text-emerald-300">
                Password Updated!
              </h3>
              <p className="text-xs text-zinc-300 font-sans">
                Your account password has been reset successfully. Your cloud watchlist is synced and ready.
              </p>
            </div>

            <ComicButton
              onClick={() => router.push('/mcu')}
              variant="gold"
              size="lg"
              className="w-full"
              rightIcon={<ArrowRight className="w-5 h-5 text-black" />}
            >
              Continue to Tracker
            </ComicButton>
          </div>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-display uppercase tracking-wider text-zinc-400 mb-1">
                New Password (min. 6 characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border-2 border-black px-3.5 py-2.5 text-sm font-sans text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 shadow-[2px_2px_0px_0px_#000000]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-display uppercase tracking-wider text-zinc-400 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border-2 border-black px-3.5 py-2.5 text-sm font-sans text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 shadow-[2px_2px_0px_0px_#000000]"
              />
            </div>

            <ComicButton
              type="submit"
              disabled={isLoading}
              variant="cyan"
              size="lg"
              className="w-full"
              leftIcon={<ShieldCheck className="w-5 h-5 text-black" />}
            >
              {isLoading ? 'Updating Password...' : 'Save New Password'}
            </ComicButton>

            <div className="text-center pt-2 border-t border-zinc-800">
              <Link
                href="/"
                className="text-xs font-sans text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Back to Home Page
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
