"use client";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const VerifyPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<Array<HTMLInputElement>>([]);
  const router = useRouter();

  const searchParams = useSearchParams();
  const email: string = searchParams.get("email") || "";

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleInputChange = (index: number, value: string): void => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      newOtp.forEach((_, index) => {
        inputRefs.current[index]?.focus();
      });
      setError("");
    } else {
      setError("Please paste a valid 6-digit OTP.");
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const handleSubmit = async (
    e: React.FormEvent<HTMLElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
              <Lock
                size={40}
                className="text-white"
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Verify Your Email
            </h1>
            <p className="text-gray-300 text-lg">
              We have sent a 6-digit OTP to
            </p>
            <p className="text-blue-400 font-medium">{email}</p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              ></label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                placeholder="Enter Your email address"
                // value={email}
                // onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-lg disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Verify</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;
